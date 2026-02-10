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
  hasProvider: boolean
): ManifestEntry {
  const existing = manifest[segmentId];
  if (existing) {
    if (hasProvider && !existing.hasProvider) {
      existing.hasProvider = true;
    }
    return existing;
  }

  const entry: ManifestEntry = {
    hasProvider,
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
      const hasProvider =
        existing === true ? true : providerSegments.has(entry.segmentId);
      segmentMap.set(entry.segmentId, hasProvider);
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
      const queue: Array<{file: string; inClient: boolean}> = [
        {file: entryFile, inClient: false}
      ];
      const visited = new Set<string>();

      while (queue.length > 0) {
        const {file, inClient} = queue.shift()!;
        const visitKey = `${file}|${inClient ? 'c' : 's'}`;
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
        for (const dep of deps) {
          if (dep.endsWith('.d.ts')) continue;
          queue.push({file: dep, inClient: effectiveClient});
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

    return manifest;
  }
}
