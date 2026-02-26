import path from 'path';
import EntryScanner, {
  type EntryScanResult
} from '../../scanner/EntryScanner.js';
import SourceFileFilter from '../../scanner/SourceFileFilter.js';
import type {ManifestNamespaces} from '../../tree-shaking/types.js';
import {isDevelopment} from '../config.js';
import type {TurbopackLoaderContext} from '../types.js';
import {PROVIDER_NAME, injectManifestProp} from './injectManifest.js';

export type ManifestLoaderConfig = {
  srcPaths: Array<string>;
  tsconfigPath: string;
};

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
    if (current[part] === true) return;
    if (isLeaf) {
      current[part] = true;
      return;
    }
    if (!(part in current)) current[part] = {};
    current = current[part] as Record<string, unknown>;
  }
}

function addToManifest(namespaces: Record<string, unknown>, id: string) {
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
  result: EntryScanResult
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

    const entry = result.get(file);
    if (!entry) continue;

    const nowClient = inClient || entry.hasUseClient;
    const effectiveClient = nowClient && !entry.hasUseServer;

    if (effectiveClient) {
      for (const m of entry.messages) {
        addToManifest(namespaces as Record<string, unknown>, m.id);
      }
    }

    for (const dep of entry.dependencies) {
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
  const callback = this.async();
  const inputFile = this.resourcePath;
  const projectRoot = this.rootContext;

  const options = this.getOptions() as ManifestLoaderConfig;
  const srcPaths = options.srcPaths;

  const inSrcPaths = srcPaths.some((cur) =>
    SourceFileFilter.isWithinPath(inputFile, path.resolve(projectRoot, cur))
  );
  if (!inSrcPaths) {
    callback(null, source);
    return source;
  }

  const hasInferProvider =
    /messages\s*=\s*["']infer["']|messages\s*=\s*\{\s*["']infer["']\s*\}/.test(
      source
    ) && new RegExp(PROVIDER_NAME).test(source);
  if (!hasInferProvider) {
    callback(null, source);
    return source;
  }

  try {
    const scanner = new EntryScanner({
      entry: inputFile,
      isDevelopment,
      projectRoot,
      srcPaths,
      tsconfigPath: options.tsconfigPath
    });
    const result = await scanner.scan();

    for (const filePath of result.keys()) {
      this.addDependency(filePath);
    }

    const namespaces = collectNamespaces(inputFile, result);

    const hasNamespaces =
      namespaces === true ||
      (typeof namespaces === 'object' && Object.keys(namespaces).length > 0);
    if (!hasNamespaces) {
      callback(null, source);
      return source;
    }

    const {code, map} = injectManifestProp(source, namespaces, {
      filename: inputFile,
      sourceMap: this.sourceMap
    });
    callback(null, code, map ?? undefined);
    return code;
  } catch (error) {
    callback(error as Error);
  }
}
