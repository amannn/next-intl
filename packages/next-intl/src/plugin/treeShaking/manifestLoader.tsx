/* eslint-disable @typescript-eslint/no-unnecessary-condition -- Loader context varies (webpack/turbopack) */
import path from 'path';
import SourceFileFilter from '../../extractor/source/SourceFileFilter.js';
import DependencyGraph from '../../tree-shaking/DependencyGraph.js';
import type {ManifestNamespaces} from '../../tree-shaking/Manifest.js';
import SourceAnalyzer from '../../tree-shaking/SourceAnalyzer.js';
import type {TurbopackLoaderContext} from '../types.js';
import type {ManifestLoaderConfig} from './manifestLoaderConfig.js';

const PROVIDER_NAME = 'NextIntlClientProvider';
const INFERRED_MANIFEST_PROP = '__inferredManifest';

function createSrcMatcher(
  projectRoot: string,
  srcPaths: Array<string>
): {matches(filePath: string): boolean} {
  const roots = srcPaths.map((srcPath) =>
    path.resolve(
      projectRoot,
      srcPath.endsWith('/') ? srcPath.slice(0, -1) : srcPath
    )
  );
  return {
    matches(filePath: string) {
      return roots.some((root) =>
        SourceFileFilter.isWithinPath(filePath, root)
      );
    }
  };
}

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
  item: {fullNamespace?: boolean; key?: string; namespace?: string}
) {
  const {fullNamespace, key, namespace} = item;
  if (namespace == null) {
    if (!key) return;
    setPathTrue(namespaces, splitPath(key));
    return;
  }
  const nsParts = splitPath(namespace);
  if (fullNamespace) {
    setPathTrue(namespaces, nsParts);
    return;
  }
  if (!key) return;
  setPathTrue(namespaces, [...nsParts, ...splitPath(key)]);
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

function injectManifestProp(
  source: string,
  manifest: ManifestNamespaces
): string {
  const manifestJson = JSON.stringify(manifest);
  const propInjection = ` ${INFERRED_MANIFEST_PROP}={${manifestJson}}`;

  const re = new RegExp(`(<${PROVIDER_NAME}(?:\\s[^>]*?)?)(\\s*>)`, 's');
  const match = source.match(re);
  if (!match) return source;

  const before = match[1];
  if (before.includes(INFERRED_MANIFEST_PROP)) return source;

  return source.replace(re, `$1${propInjection}$2`);
}

export default async function manifestLoader(
  this: TurbopackLoaderContext<ManifestLoaderConfig>,
  source: string
): Promise<string | void> {
  const callback = this.async?.();
  const inputFile = this.resourcePath;
  const rootContext = this.rootContext ?? process.cwd();

  const options = (this.getOptions?.() ?? {}) as Partial<ManifestLoaderConfig>;
  const srcPaths = options.srcPath;
  const projectRoot = options.projectRoot ?? rootContext;

  if (!srcPaths || !Array.isArray(srcPaths)) {
    callback?.(null, source);
    return source;
  }

  const hasInferProvider =
    /messages\s*=\s*["']infer["']|messages\s*=\s*\{\s*["']infer["']\s*\}/.test(
      source
    ) && new RegExp(PROVIDER_NAME).test(source);

  if (!hasInferProvider) {
    callback?.(null, source);
    return source;
  }

  const srcMatcher = createSrcMatcher(projectRoot, srcPaths);
  if (!srcMatcher.matches(inputFile)) {
    callback?.(null, source);
    return source;
  }

  const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
  const dependencyGraph = new DependencyGraph({
    projectRoot,
    srcMatcher,
    tsconfigPath
  });

  try {
    const graph = await dependencyGraph.getEntryGraph(inputFile);

    for (const filePath of graph.files) {
      this.addDependency?.(filePath);
    }

    const sourceAnalyzer = new SourceAnalyzer();
    let namespaces: ManifestNamespaces = {};
    const queue: Array<TraversalNode> = [{file: inputFile, inClient: false}];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const node = queue.shift()!;
      const {file, inClient} = node;
      const visitKey = `${file}|${inClient ? 'c' : 's'}`;
      if (visited.has(visitKey)) continue;
      visited.add(visitKey);

      if (!srcMatcher.matches(file)) continue;

      const analysis = await sourceAnalyzer.analyzeFile(file);
      const nowClient = inClient || analysis.hasUseClient;
      const effectiveClient = nowClient && !analysis.hasUseServer;

      if (effectiveClient) {
        if (analysis.requiresAllMessages) namespaces = true;
        if (namespaces !== true) {
          for (const translation of analysis.translations) {
            addToManifest(namespaces as Record<string, unknown>, translation);
          }
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

    const hasNamespaces =
      namespaces === true ||
      (typeof namespaces === 'object' && Object.keys(namespaces).length > 0);
    if (!hasNamespaces) {
      callback?.(null, source);
      return source;
    }

    const result = injectManifestProp(source, namespaces);
    callback?.(null, result);
    return result;
  } catch (error) {
    callback?.(error as Error);
    throw error;
  }
}
