/* eslint-disable @typescript-eslint/no-unnecessary-condition -- Loader context varies (webpack/turbopack) */
import fs from 'fs/promises';
import path from 'path';
import SourceFileFilter from '../../extractor/source/SourceFileFilter.js';
import DependencyGraph from '../../tree-shaking/DependencyGraph.js';
import {getSegmentId} from '../../tree-shaking/EntryScanner.js';
import type {
  Manifest,
  ManifestEntry,
  ManifestNamespaces
} from '../../tree-shaking/Manifest.js';
import SourceAnalyzer from '../../tree-shaking/SourceAnalyzer.js';
import type {TurbopackLoaderContext} from '../types.js';
import type {ManifestLoaderConfig} from './manifestLoaderConfig.js';

const LAYOUT_SUFFIX = '__layout';

let manifestWriteLock = Promise.resolve();

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

function mergeNamespaces(
  target: ManifestNamespaces,
  source: ManifestNamespaces
): ManifestNamespaces {
  if (target === true || source === true) return true;
  const targetMap = target as Record<string, unknown>;
  const sourceMap = source as Record<string, unknown>;
  for (const [key, value] of Object.entries(sourceMap)) {
    if (value === true) {
      targetMap[key] = true;
    } else if (typeof value === 'object' && value !== null) {
      const existing = targetMap[key];
      if (existing === true) continue;
      if (typeof existing === 'object' && existing !== null) {
        mergeNamespaces(
          existing as ManifestNamespaces,
          value as ManifestNamespaces
        );
      } else {
        targetMap[key] = JSON.parse(JSON.stringify(value));
      }
    }
  }
  return target;
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

  const appDirs: Array<string> = [];
  for (const srcPath of srcPaths) {
    const absSrc = path.resolve(projectRoot, srcPath);
    const candidate = path.join(absSrc, 'app');
    try {
      const stats = await fs.stat(candidate);
      if (stats.isDirectory()) {
        appDirs.push(candidate);
        continue;
      }
    } catch {
      // ignore
    }
    try {
      const stats = await fs.stat(absSrc);
      if (stats.isDirectory() && path.basename(absSrc) === 'app') {
        appDirs.push(absSrc);
      }
    } catch {
      // ignore
    }
  }

  const appDir = appDirs.find((dir) =>
    SourceFileFilter.isWithinPath(inputFile, dir)
  );
  if (!appDir) {
    callback?.(null, source);
    return source;
  }

  const segmentId = getSegmentId(inputFile, appDir);
  const isLayout = path.basename(inputFile).startsWith('layout.');
  const hasInferProvider =
    /messages\s*=\s*["']infer["']|messages\s*=\s*\{\s*["']infer["']\s*\}/.test(
      source
    ) && /NextIntlClientProvider/.test(source);

  if (isLayout && !hasInferProvider) {
    callback?.(null, source);
    return source;
  }

  const manifestKey = isLayout ? `${segmentId}${LAYOUT_SUFFIX}` : segmentId;

  const srcMatcher = createSrcMatcher(projectRoot, srcPaths);
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

    const hasTranslations =
      namespaces === true ||
      (typeof namespaces === 'object' && Object.keys(namespaces).length > 0);
    if (!hasTranslations && !isLayout) {
      if (callback) callback(null, source);
      return source;
    }

    const manifestDir = path.join(
      projectRoot,
      'node_modules',
      '.cache',
      'next-intl'
    );
    const manifestPath = path.join(manifestDir, 'client-manifest.json');

    await manifestWriteLock;

    let resolveLock: () => void;
    manifestWriteLock = new Promise<void>((resolve) => {
      resolveLock = resolve;
    });

    try {
      let manifest: Manifest = {};
      try {
        const content = await fs.readFile(manifestPath, 'utf8');
        manifest = JSON.parse(content) as Manifest;
      } catch {
        await fs.mkdir(manifestDir, {recursive: true});
      }

      const entry: ManifestEntry = {
        hasLayoutProvider: isLayout,
        namespaces
      };

      const existing = manifest[manifestKey];
      if (existing) {
        entry.namespaces = mergeNamespaces(existing.namespaces, namespaces);
        entry.hasLayoutProvider = existing.hasLayoutProvider || isLayout;
      }
      manifest[manifestKey] = entry;

      await fs.writeFile(
        manifestPath,
        JSON.stringify(manifest, null, 2),
        'utf8'
      );
    } finally {
      resolveLock!();
    }

    this.addDependency?.(manifestPath);

    callback?.(null, source);
    return source;
  } catch (error) {
    if (callback) callback(error as Error);
    throw error;
  }
}
