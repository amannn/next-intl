/* eslint-disable @typescript-eslint/no-unnecessary-condition -- Loader context varies (webpack/turbopack) */
import path from 'path';
import SourceFileFilter from '../../extractor/source/SourceFileFilter.js';
import Scanner from '../../scanner/Scanner.js';
import type {ManifestNamespaces} from '../../tree-shaking/Manifest.js';
import type {TurbopackLoaderContext} from '../types.js';
import {PROVIDER_NAME, injectManifestProp} from './injectManifest.js';
import type {ManifestLoaderConfig} from './manifestLoaderConfig.js';

function splitPath(input: string): Array<string> {
  return input.split('.').filter(Boolean);
}

function setPathTrue(
  container: Record<string, unknown>,
  pathParts: Array<string>
) {
  if (pathParts.length === 0) return;
  let current: Record<string, unknown> = container;
  for (let index = 0; index < pathParts.length; index++) {
    const part = pathParts[index];
    const isLeaf = index === pathParts.length - 1;
    const existing = current[part];
    if (existing === true) return;
    if (isLeaf) {
      current[part] = true;
      return;
    }
    if (!(part in current)) current[part] = {};
    current = current[part] as Record<string, unknown>;
  }
}

function addToManifest(
  namespaces: Record<string, unknown>,
  id: string
) {
  if (!id) return;
  setPathTrue(namespaces, splitPath(id));
}

type TraversalNode = {file: string; inClient: boolean; parent?: TraversalNode};

function hasAncestor(node: TraversalNode, target: string): boolean {
  let cur: TraversalNode | undefined = node;
  while (cur) {
    if (cur.file === target) return true;
    cur = cur.parent;
  }
  return false;
}

function collectNamespaces(
  inputFile: string,
  graph: {adjacency: Map<string, Set<string>>},
  analysisByFile: Map<
    string,
    {
      translations: Array<{id: string}>;
      hasUseClient: boolean;
      hasUseServer: boolean;
    }
  >,
  messagesByFile: Map<string, Array<{id: string}>>
): ManifestNamespaces {
  const namespaces: ManifestNamespaces = {};
  const queue: Array<TraversalNode> = [{file: inputFile, inClient: false}];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const node = queue.shift()!;
    const {file, inClient} = node;
    const visitKey = `${file}|${inClient ? 'c' : 's'}`;
    if (visited.has(visitKey)) continue;
    visited.add(visitKey);

    const analysis = analysisByFile.get(file);
    if (!analysis) continue;

    const nowClient = inClient || analysis.hasUseClient;
    const effectiveClient = nowClient && !analysis.hasUseServer;

    if (effectiveClient) {
      for (const t of analysis.translations) {
        addToManifest(namespaces as Record<string, unknown>, t.id);
      }
      const extracted = messagesByFile.get(file) ?? [];
      for (const m of extracted) {
        addToManifest(namespaces as Record<string, unknown>, m.id);
      }
    }

    const deps = graph.adjacency.get(file);
    if (!deps) continue;
    for (const dep of deps) {
      if (dep.endsWith('.d.ts')) continue;
      if (hasAncestor(node, dep)) continue;
      queue.push({file: dep, inClient: effectiveClient, parent: node});
    }
  }

  return namespaces;
}

export default async function manifestLoader(
  this: TurbopackLoaderContext<ManifestLoaderConfig>,
  source: string
): Promise<string | void> {
  const callback = this.async?.();
  const inputFile = this.resourcePath;
  const rootContext = this.rootContext ?? process.cwd();

  const hasInferProvider =
    /messages\s*=\s*["']infer["']|messages\s*=\s*\{\s*["']infer["']\s*\}/.test(
      source
    ) && new RegExp(PROVIDER_NAME).test(source);
  if (!hasInferProvider) {
    callback?.(null, source);
    return source;
  }

  const options = (this.getOptions?.() ?? {}) as Partial<ManifestLoaderConfig>;
  const srcPaths = options.srcPaths;
  const projectRoot = options.projectRoot ?? rootContext;
  if (!srcPaths || !Array.isArray(srcPaths)) {
    callback?.(null, source);
    return source;
  }

  const srcRoots = srcPaths.map((cur) =>
    path.resolve(projectRoot, cur.endsWith('/') ? cur.slice(0, -1) : cur)
  );
  const inSrcPaths = srcRoots.some((root) =>
    SourceFileFilter.isWithinPath(inputFile, root)
  );
  if (!inSrcPaths) {
    callback?.(null, source);
    return source;
  }

  try {
    const scanner = new Scanner({
      projectRoot,
      entry: inputFile,
      srcPaths,
      tsconfigPath: path.join(projectRoot, 'tsconfig.json')
    });
    const result = await scanner.scan();

    for (const filePath of result.files) {
      this.addDependency?.(filePath);
    }

    const namespaces = collectNamespaces(
      inputFile,
      result.graph,
      result.analysisByFile,
      result.messagesByFile
    );

    const hasNamespaces =
      namespaces === true ||
      (typeof namespaces === 'object' && Object.keys(namespaces).length > 0);
    if (!hasNamespaces) {
      callback?.(null, source);
      return source;
    }

    const {code, map} = injectManifestProp(source, namespaces, {
      filename: inputFile,
      sourceMap: this.sourceMap
    });
    callback?.(null, code, map ?? undefined);
    return code;
  } catch (error) {
    callback?.(error as Error);
    throw error;
  }
}
