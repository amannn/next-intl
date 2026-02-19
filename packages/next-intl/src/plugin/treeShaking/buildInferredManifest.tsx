import path from 'path';
import SourceFileFilter from '../../extractor/source/SourceFileFilter.js';
import DependencyGraph from '../../tree-shaking/DependencyGraph.js';
import type {ManifestNamespaces} from '../../tree-shaking/Manifest.js';
import SourceAnalyzer from '../../tree-shaking/SourceAnalyzer.js';
import {getSiblingRouteFiles} from './routeSiblings.js';

type SrcMatcher = {matches(filePath: string): boolean};

type EntryGraph = {
  adjacency: Map<string, Set<string>>;
  files: Set<string>;
};

export function createSrcMatcher(
  projectRoot: string,
  srcPaths: Array<string>
): SrcMatcher {
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

async function collectNamespacesFromGraph(
  graph: EntryGraph,
  inputFile: string,
  srcMatcher: SrcMatcher,
  sourceAnalyzer: SourceAnalyzer
): Promise<ManifestNamespaces> {
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

  return namespaces;
}

async function mergeSiblingGraphs(
  graph: EntryGraph,
  inputFile: string,
  siblings: Array<string>,
  dependencyGraph: DependencyGraph
): Promise<void> {
  const siblingGraphs = await Promise.all(
    siblings.map((sibling) => dependencyGraph.getEntryGraph(sibling))
  );
  for (const siblingGraph of siblingGraphs) {
    for (const [file, deps] of siblingGraph.adjacency) {
      const existing = graph.adjacency.get(file);
      if (existing) {
        for (const dep of deps) existing.add(dep);
      } else {
        graph.adjacency.set(file, new Set(deps));
      }
    }
    for (const file of siblingGraph.files) graph.files.add(file);
  }
  const layoutDeps = graph.adjacency.get(inputFile);
  if (layoutDeps) {
    for (const sibling of siblings) layoutDeps.add(sibling);
  } else {
    graph.adjacency.set(inputFile, new Set(siblings));
  }
}

export async function buildInferredManifest(
  inputFile: string,
  projectRoot: string,
  srcMatcher: SrcMatcher,
  tsconfigPath: string
): Promise<{
  graph: EntryGraph;
  namespaces: ManifestNamespaces;
}> {
  const dependencyGraph = new DependencyGraph({
    projectRoot,
    srcMatcher,
    tsconfigPath
  });

  const graph = await dependencyGraph.getEntryGraph(inputFile);

  const isLayout = /\b(?:layout)\.(?:tsx?|jsx?)$/.test(inputFile);
  if (isLayout) {
    const siblings = getSiblingRouteFiles(inputFile).filter((file) =>
      srcMatcher.matches(file)
    );
    await mergeSiblingGraphs(graph, inputFile, siblings, dependencyGraph);
  }

  const sourceAnalyzer = new SourceAnalyzer();
  const namespaces = await collectNamespacesFromGraph(
    graph,
    inputFile,
    srcMatcher,
    sourceAnalyzer
  );

  return {graph, namespaces};
}
