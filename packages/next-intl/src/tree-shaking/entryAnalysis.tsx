import type {ManifestNamespaceMap, ManifestNamespaces} from './Manifest.js';
import type SourceAnalyzer from './SourceAnalyzer.js';
import type {SourcePathMatcher} from './sourcePathMatcher.js';

type TraversalNode = {
  file: string;
  inClient: boolean;
  parent?: TraversalNode;
};

type TranslationUse = {
  fullNamespace?: boolean;
  key?: string;
  namespace?: string;
};

function splitPath(input: string): Array<string> {
  return input.split('.').filter(Boolean);
}

function hasAncestor(node: TraversalNode, targetFile: string): boolean {
  let current: TraversalNode | undefined = node;

  while (current) {
    if (current.file === targetFile) {
      return true;
    }
    current = current.parent;
  }

  return false;
}

function setPathTrue(
  container: ManifestNamespaceMap,
  pathParts: Array<string>
): void {
  if (pathParts.length === 0) {
    return;
  }

  let current: ManifestNamespaceMap = container;
  for (let index = 0; index < pathParts.length; index++) {
    const part = pathParts[index];
    const isLeaf = index === pathParts.length - 1;
    const existing = current[part];
    if (existing === true) {
      return;
    }

    if (isLeaf) {
      current[part] = true;
      return;
    }

    if (!(part in current)) {
      current[part] = {};
    }

    current = current[part] as ManifestNamespaceMap;
  }
}

function addToManifest(
  namespaces: ManifestNamespaceMap,
  item: TranslationUse
): void {
  const {fullNamespace, key, namespace} = item;

  if (namespace == null) {
    if (!key) return;
    setPathTrue(namespaces, splitPath(key));
    return;
  }

  const namespaceParts = splitPath(namespace);
  if (fullNamespace) {
    setPathTrue(namespaces, namespaceParts);
    return;
  }

  if (!key) return;
  setPathTrue(namespaces, [...namespaceParts, ...splitPath(key)]);
}

function mergeNamespaceMaps(
  target: ManifestNamespaceMap,
  source: ManifestNamespaceMap
): void {
  for (const [namespace, value] of Object.entries(source)) {
    if (value === true) {
      target[namespace] = true;
      continue;
    }

    const existing = target[namespace];
    if (existing === true) {
      continue;
    }

    if (typeof existing === 'object') {
      mergeNamespaceMaps(existing, value);
      continue;
    }

    target[namespace] = {...value};
  }
}

export function mergeNamespaces(
  target: ManifestNamespaces,
  source: ManifestNamespaces
): ManifestNamespaces {
  if (target === true || source === true) {
    return true;
  }

  mergeNamespaceMaps(target, source);
  return target;
}

export function hasTranslationUsage(namespaces: ManifestNamespaces): boolean {
  return namespaces === true || Object.keys(namespaces).length > 0;
}

export async function analyzeEntryNamespaces({
  entryFile,
  graphAdjacency,
  sourceAnalyzer,
  srcMatcher
}: {
  entryFile: string;
  graphAdjacency: Map<string, Set<string>>;
  sourceAnalyzer: SourceAnalyzer;
  srcMatcher: SourcePathMatcher;
}): Promise<ManifestNamespaces> {
  let namespaces: ManifestNamespaces = {};
  const queue: Array<TraversalNode> = [{file: entryFile, inClient: false}];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const node = queue.shift()!;
    const {file, inClient} = node;
    const visitKey = `${file}|${inClient ? 'c' : 's'}`;
    if (visited.has(visitKey)) continue;
    visited.add(visitKey);

    if (!srcMatcher.matches(file)) {
      continue;
    }

    const analysis = await sourceAnalyzer.analyzeFile(file);
    const nowClient = inClient || analysis.hasUseClient;
    const effectiveClient = nowClient && !analysis.hasUseServer;

    if (effectiveClient) {
      if (analysis.requiresAllMessages) {
        namespaces = true;
      }
      if (namespaces !== true) {
        for (const translation of analysis.translations) {
          addToManifest(namespaces, translation);
        }
      }
    }

    const deps = graphAdjacency.get(file);
    if (!deps) continue;
    for (const dependencyPath of deps) {
      if (dependencyPath.endsWith('.d.ts')) continue;
      if (hasAncestor(node, dependencyPath)) {
        continue;
      }
      queue.push({
        file: dependencyPath,
        inClient: effectiveClient,
        parent: node
      });
    }
  }

  return namespaces;
}
