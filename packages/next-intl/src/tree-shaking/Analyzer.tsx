import path from 'path';
import SourceFileFilter from '../extractor/source/SourceFileFilter.js';
import DependencyGraph from './DependencyGraph.js';
import {
  type EntryFile,
  hasNextIntlClientProvider,
  scanEntryFiles
} from './EntryScanner.js';
import {
  type Manifest,
  type ManifestEntry,
  type ManifestNamespaceMap,
  type ManifestNamespaces,
  createEmptyManifest
} from './Manifest.js';
import SourceAnalyzer from './SourceAnalyzer.js';

type EntryResult = {
  namespaces: ManifestNamespaces;
  segmentId: string;
};

type SourcePathMatcher = {
  matches(filePath: string): boolean;
};

type TraversalNode = {
  file: string;
  inClient: boolean;
  requestedExports: RequestedExports;
  parent?: TraversalNode;
};

type RequestedExports = 'all' | Set<string>;

const IMPORT_RESOLVE_EXTENSIONS = [
  '.cjs',
  '.js',
  '.jsx',
  '.mjs',
  '.ts',
  '.tsx'
];

function normalizeSrcPaths(
  projectRoot: string,
  srcPaths: Array<string>
): Array<string> {
  return srcPaths.map((srcPath) =>
    path.resolve(
      projectRoot,
      srcPath.endsWith('/') ? srcPath.slice(0, -1) : srcPath
    )
  );
}

function createSourcePathMatcher(
  projectRoot: string,
  srcPaths: Array<string>
): SourcePathMatcher {
  const roots = normalizeSrcPaths(projectRoot, srcPaths);
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

function splitSegmentId(segmentId: string): Array<string> {
  return segmentId.split('/').filter(Boolean);
}

function compareSegmentsByHierarchy(left: string, right: string): number {
  const leftSegments = splitSegmentId(left);
  const rightSegments = splitSegmentId(right);
  const length = Math.min(leftSegments.length, rightSegments.length);

  for (let index = 0; index < length; index++) {
    const compare = leftSegments[index].localeCompare(rightSegments[index]);
    if (compare !== 0) {
      return compare;
    }
  }

  return leftSegments.length - rightSegments.length;
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

function cloneRequestedExports(
  requestedExports: RequestedExports
): RequestedExports {
  if (requestedExports === 'all') {
    return 'all';
  }

  return new Set(requestedExports);
}

function mergeRequestedExports(
  current: RequestedExports | undefined,
  next: RequestedExports
): RequestedExports {
  if (!current) {
    return cloneRequestedExports(next);
  }

  if (current === 'all' || next === 'all') {
    return 'all';
  }

  const merged = new Set(current);
  for (const value of next) {
    merged.add(value);
  }
  return merged;
}

function getRequestedExportsKey(requestedExports: RequestedExports): string {
  if (requestedExports === 'all') {
    return '*';
  }

  return Array.from(requestedExports).sort().join(',');
}

function resolveImportCandidates(
  filePath: string,
  source: string
): Array<string> {
  if (!source.startsWith('.') && !source.startsWith('/')) {
    return [];
  }

  const basePath = source.startsWith('/')
    ? path.resolve(source)
    : path.resolve(path.dirname(filePath), source);
  const candidates = new Set<string>();
  candidates.add(path.normalize(basePath));

  for (const extension of IMPORT_RESOLVE_EXTENSIONS) {
    candidates.add(path.normalize(`${basePath}${extension}`));
    candidates.add(path.normalize(path.join(basePath, `index${extension}`)));
  }

  return Array.from(candidates);
}

function resolveDependencyFile(
  filePath: string,
  source: string,
  dependenciesByPath: Map<string, string>
): string | undefined {
  for (const candidate of resolveImportCandidates(filePath, source)) {
    const dependencyFile = dependenciesByPath.get(candidate);
    if (dependencyFile) {
      return dependencyFile;
    }
  }

  return undefined;
}

function getRequestedExportsFromReference(
  reference: {
    exportAll?: boolean;
    imported?: 'all' | Array<string>;
    kind: 'moduleImport' | 'moduleReexport';
    mappings?: Array<{exported: string; imported: string}>;
  },
  requestedExports: RequestedExports
): RequestedExports | undefined {
  if (reference.kind === 'moduleImport') {
    if (reference.imported === 'all') {
      return 'all';
    }

    if (!reference.imported) {
      return undefined;
    }

    const imported = new Set(reference.imported);
    if (imported.size === 0) {
      return undefined;
    }
    return imported;
  }

  if (reference.exportAll) {
    return cloneRequestedExports(requestedExports);
  }

  const mappings = reference.mappings ?? [];
  if (requestedExports === 'all') {
    const imported = new Set<string>();
    for (const mapping of mappings) {
      if (mapping.imported === '*') {
        return 'all';
      }
      imported.add(mapping.imported);
    }
    if (imported.size === 0) {
      return undefined;
    }
    return imported;
  }

  const imported = new Set<string>();
  for (const mapping of mappings) {
    if (!requestedExports.has(mapping.exported)) {
      continue;
    }
    if (mapping.imported === '*') {
      return 'all';
    }
    imported.add(mapping.imported);
  }

  if (imported.size === 0) {
    return undefined;
  }

  return imported;
}

function collectDependencyRequests({
  dependencies,
  dependencyReferences,
  filePath,
  requestedExports
}: {
  dependencies: Set<string>;
  dependencyReferences: Array<{
    exportAll?: boolean;
    imported?: 'all' | Array<string>;
    kind: 'moduleImport' | 'moduleReexport';
    mappings?: Array<{exported: string; imported: string}>;
    source: string;
  }>;
  filePath: string;
  requestedExports: RequestedExports;
}): Map<string, RequestedExports> {
  const requests = new Map<string, RequestedExports>();
  const dependenciesByPath = new Map<string, string>();
  const matchedDependencies = new Set<string>();

  for (const dependency of dependencies) {
    dependenciesByPath.set(path.normalize(dependency), dependency);
  }

  for (const reference of dependencyReferences) {
    const dependencyFile = resolveDependencyFile(
      filePath,
      reference.source,
      dependenciesByPath
    );
    if (!dependencyFile) {
      continue;
    }

    matchedDependencies.add(dependencyFile);
    const nextRequestedExports = getRequestedExportsFromReference(
      reference,
      requestedExports
    );
    if (!nextRequestedExports) {
      continue;
    }

    const previousRequestedExports = requests.get(dependencyFile);
    requests.set(
      dependencyFile,
      mergeRequestedExports(previousRequestedExports, nextRequestedExports)
    );
  }

  for (const dependency of dependencies) {
    if (!matchedDependencies.has(dependency)) {
      requests.set(dependency, 'all');
    }
  }

  return requests;
}

function setPathTrue(
  container: ManifestNamespaceMap,
  pathParts: Array<string>
) {
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

function mergeNamespaceMaps(
  target: ManifestNamespaceMap,
  source: ManifestNamespaceMap
) {
  for (const [ns, value] of Object.entries(source)) {
    if (value === true) {
      target[ns] = true;
      continue;
    }
    const existing = target[ns];
    if (existing === true) {
      continue;
    }
    if (typeof existing === 'object') {
      mergeNamespaceMaps(existing, value);
      continue;
    }
    target[ns] = {...value};
  }
}

function mergeNamespaces(
  target: ManifestNamespaces,
  source: ManifestNamespaces
): ManifestNamespaces {
  if (target === true || source === true) {
    return true;
  }

  mergeNamespaceMaps(target, source);
  return target;
}

function hasTranslationUsage(namespaces: ManifestNamespaces): boolean {
  return namespaces === true || Object.keys(namespaces).length > 0;
}

function ensureManifestEntry(
  manifest: Manifest,
  segmentId: string,
  hasLayoutProvider: boolean
): ManifestEntry {
  const existing = manifest[segmentId];
  if (existing) {
    if (hasLayoutProvider && !existing.hasLayoutProvider) {
      existing.hasLayoutProvider = true;
    }
    return existing;
  }

  const entry: ManifestEntry = {
    hasLayoutProvider,
    namespaces: {}
  };
  manifest[segmentId] = entry;
  return entry;
}

function getAppDirForFile(
  filePath: string,
  appDirs: Array<string>
): string | undefined {
  for (const appDir of appDirs) {
    if (SourceFileFilter.isWithinPath(filePath, appDir)) {
      return appDir;
    }
  }
  return undefined;
}

export default class TreeShakingAnalyzer {
  private dependencyGraph: DependencyGraph;
  private entryDependencies = new Map<string, Set<string>>();
  private entryResults = new Map<string, EntryResult>();
  private fileToEntries = new Map<string, Set<string>>();
  private sourceAnalyzer = new SourceAnalyzer();
  private srcMatcher: SourcePathMatcher;

  public constructor({
    projectRoot,
    srcPaths,
    tsconfigPath
  }: {
    projectRoot: string;
    srcPaths: Array<string>;
    tsconfigPath?: string;
  }) {
    this.srcMatcher = createSourcePathMatcher(projectRoot, srcPaths);
    this.dependencyGraph = new DependencyGraph({
      projectRoot,
      srcMatcher: this.srcMatcher,
      tsconfigPath
    });
  }

  private dropEntry(entryFile: string) {
    const deps = this.entryDependencies.get(entryFile);
    if (deps) {
      for (const filePath of deps) {
        const entries = this.fileToEntries.get(filePath);
        if (!entries) continue;
        entries.delete(entryFile);
        if (entries.size === 0) {
          this.fileToEntries.delete(filePath);
        }
      }
    }
    this.entryDependencies.delete(entryFile);
    this.entryResults.delete(entryFile);
  }

  private updateEntryDependencies(entryFile: string, files: Set<string>) {
    this.dropEntry(entryFile);
    this.entryDependencies.set(entryFile, files);
    for (const filePath of files) {
      let entries = this.fileToEntries.get(filePath);
      if (!entries) {
        entries = new Set();
        this.fileToEntries.set(filePath, entries);
      }
      entries.add(entryFile);
    }
  }

  public async analyze({
    appDirs,
    changedFiles
  }: {
    appDirs: Array<string>;
    changedFiles?: Array<string>;
  }): Promise<Manifest> {
    const entryFiles = await scanEntryFiles(appDirs);
    const entryFilePaths = entryFiles.map((entry) => entry.filePath);
    const entryFileSet = new Set(entryFilePaths);
    const entryInfo = new Map<string, EntryFile>(
      entryFiles.map((entry) => [entry.filePath, entry])
    );

    for (const entryFile of this.entryResults.keys()) {
      if (!entryFileSet.has(entryFile)) {
        this.dropEntry(entryFile);
      }
    }

    const providerSegments = new Set<string>();
    for (const entry of entryFiles) {
      if (entry.name !== 'layout') continue;
      if (await hasNextIntlClientProvider(entry.filePath)) {
        providerSegments.add(entry.segmentId);
      }
    }

    const segmentMap = new Map<string, boolean>();
    for (const entry of entryFiles) {
      const existing = segmentMap.get(entry.segmentId);
      const hasLayoutProvider =
        existing === true ? true : providerSegments.has(entry.segmentId);
      segmentMap.set(entry.segmentId, hasLayoutProvider);
    }

    let entriesToAnalyze = entryFilePaths;

    if (changedFiles && this.entryResults.size > 0) {
      const impactedEntries = new Set<string>();
      const rescannedAppDirs = new Set<string>();
      const normalizedChanges = changedFiles.map((filePath) =>
        path.resolve(filePath)
      );

      this.sourceAnalyzer.clearCache(normalizedChanges);

      for (const filePath of normalizedChanges) {
        const directEntry = entryFileSet.has(filePath);
        if (directEntry) {
          impactedEntries.add(filePath);
        }

        const fromGraph = this.fileToEntries.get(filePath);
        if (fromGraph) {
          for (const entry of fromGraph) {
            impactedEntries.add(entry);
          }
          continue;
        }

        const appDir = getAppDirForFile(filePath, appDirs);
        if (appDir) {
          rescannedAppDirs.add(appDir);
        }
      }

      if (rescannedAppDirs.size > 0) {
        for (const entry of entryFiles) {
          if (rescannedAppDirs.has(entry.appDir)) {
            impactedEntries.add(entry.filePath);
          }
        }
      }

      entriesToAnalyze = Array.from(impactedEntries);
    }

    if (entriesToAnalyze.length > 0) {
      this.dependencyGraph.clearEntries(entriesToAnalyze);
    }

    for (const entryFile of entriesToAnalyze) {
      const entryMeta = entryInfo.get(entryFile);
      if (!entryMeta) continue;
      const graph = await this.dependencyGraph.getEntryGraph(entryFile);
      this.updateEntryDependencies(entryFile, graph.files);

      let namespaces: ManifestNamespaces = {};
      const queue: Array<TraversalNode> = [
        {file: entryFile, inClient: false, requestedExports: 'all'}
      ];
      const visited = new Set<string>();

      while (queue.length > 0) {
        const node = queue.shift()!;
        const {file, inClient, requestedExports} = node;
        const visitKey = `${file}|${inClient ? 'c' : 's'}|${getRequestedExportsKey(
          requestedExports
        )}`;
        if (visited.has(visitKey)) continue;
        visited.add(visitKey);

        if (!this.srcMatcher.matches(file)) {
          continue;
        }

        const analysis = await this.sourceAnalyzer.analyzeFile(file);
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

        const deps = graph.adjacency.get(file);
        if (!deps) continue;
        const runtimeDependencies = new Set<string>();
        for (const dep of deps) {
          if (dep.endsWith('.d.ts')) continue;
          runtimeDependencies.add(dep);
        }
        const dependencyRequests = collectDependencyRequests({
          dependencies: runtimeDependencies,
          dependencyReferences: analysis.dependencyReferences,
          filePath: file,
          requestedExports
        });
        for (const [dep, depRequestedExports] of dependencyRequests.entries()) {
          if (hasAncestor(node, dep)) {
            continue;
          }
          queue.push({
            file: dep,
            inClient: effectiveClient,
            parent: node,
            requestedExports: depRequestedExports
          });
        }
      }

      this.entryResults.set(entryFile, {
        namespaces,
        segmentId: entryMeta.segmentId
      });
    }

    const manifest = createEmptyManifest();

    for (const entry of this.entryResults.values()) {
      if (!hasTranslationUsage(entry.namespaces)) {
        continue;
      }

      const manifestEntry =
        manifest[entry.segmentId] ??
        ensureManifestEntry(
          manifest,
          entry.segmentId,
          segmentMap.get(entry.segmentId) === true
        );
      manifestEntry.namespaces = mergeNamespaces(
        manifestEntry.namespaces,
        entry.namespaces
      );
    }

    for (const [segmentId, hasLayoutProvider] of segmentMap.entries()) {
      if (!hasLayoutProvider) {
        continue;
      }
      ensureManifestEntry(manifest, segmentId, true);
    }

    const sortedManifest = createEmptyManifest();
    for (const [segmentId, entry] of Object.entries(manifest).sort(
      ([left], [right]) => compareSegmentsByHierarchy(left, right)
    )) {
      sortedManifest[segmentId] = entry;
    }

    return sortedManifest;
  }
}
