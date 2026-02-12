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
  type ManifestNamespaces,
  createEmptyManifest
} from './Manifest.js';
import SourceAnalyzer from './SourceAnalyzer.js';
import {
  analyzeEntryNamespaces,
  hasTranslationUsage,
  mergeNamespaces
} from './entryAnalysis.js';
import createSourcePathMatcher, {
  type SourcePathMatcher
} from './sourcePathMatcher.js';

type EntryResult = {
  namespaces: ManifestNamespaces;
  segmentId: string;
};

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
      const namespaces = await analyzeEntryNamespaces({
        entryFile,
        graphAdjacency: graph.adjacency,
        sourceAnalyzer: this.sourceAnalyzer,
        srcMatcher: this.srcMatcher
      });

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
