import path from 'path';
import DependencyGraph from '../../tree-shaking/DependencyGraph.js';
import {
  type EntryFile,
  getSegmentId,
  hasNextIntlClientProvider,
  scanEntryFiles
} from '../../tree-shaking/EntryScanner.js';
import {
  type Manifest,
  type ManifestNamespaces,
  createEmptyManifest
} from '../../tree-shaking/Manifest.js';
import SourceAnalyzer from '../../tree-shaking/SourceAnalyzer.js';
import {
  analyzeEntryNamespaces,
  hasTranslationUsage,
  mergeNamespaces
} from '../../tree-shaking/entryAnalysis.js';
import {
  isOwnedBySegment,
  normalizeSegmentId
} from '../../tree-shaking/inferMessages.js';
import createSourcePathMatcher from '../../tree-shaking/sourcePathMatcher.js';
import type {TurbopackLoaderContext} from '../types.js';
import {resolveAppDirForResource} from './layoutSegmentLoader.js';

export type SegmentManifestLoaderConfig = {
  srcPath: string | Array<string>;
};

type ParsedQuery = {
  layoutPath: string;
  segmentId: string;
};

function serializeModule(value: unknown): string {
  if (value === undefined) {
    return 'export default undefined;';
  }

  return `export default ${JSON.stringify(value)};`;
}

function parseManifestSource(source: string): unknown {
  try {
    return JSON.parse(source) as unknown;
  } catch {
    return {};
  }
}

function parseQuery(
  resourceQuery: string | undefined
): ParsedQuery | undefined {
  if (!resourceQuery) {
    return undefined;
  }

  const query = resourceQuery.startsWith('?')
    ? resourceQuery.slice(1)
    : resourceQuery;
  const params = new URLSearchParams(query);
  const layoutPath = params.get('layout');
  const segmentId = params.get('segment');
  if (!layoutPath || !segmentId) {
    return undefined;
  }

  return {
    layoutPath,
    segmentId
  };
}

function ensureManifestEntry(
  manifest: Manifest,
  segmentId: string,
  hasLayoutProvider: boolean
) {
  const existing = manifest[segmentId];
  if (existing) {
    if (hasLayoutProvider && !existing.hasLayoutProvider) {
      existing.hasLayoutProvider = true;
    }
    return;
  }

  manifest[segmentId] = {
    hasLayoutProvider,
    namespaces: {}
  };
}

function isInSegmentSubtree(
  ownerSegment: string,
  candidateSegment: string
): boolean {
  if (ownerSegment === '/') {
    return candidateSegment.startsWith('/');
  }

  return (
    candidateSegment === ownerSegment ||
    candidateSegment.startsWith(`${ownerSegment}/`)
  );
}

function getSegmentDirectory(appDir: string, segmentId: string): string {
  const parts = normalizeSegmentId(segmentId).split('/').filter(Boolean);
  if (parts.length === 0) {
    return appDir;
  }

  return path.join(appDir, ...parts);
}

async function getProviderSegments(
  entryFiles: Array<EntryFile>
): Promise<Set<string>> {
  const providerSegments = new Set<string>();

  for (const entry of entryFiles) {
    if (entry.name !== 'layout') {
      continue;
    }

    if (await hasNextIntlClientProvider(entry.filePath)) {
      providerSegments.add(entry.segmentId);
    }
  }

  return providerSegments;
}

function createOwnershipManifest(
  entryFiles: Array<EntryFile>,
  providerSegments: Set<string>
): Manifest {
  const manifest = createEmptyManifest();

  for (const entry of entryFiles) {
    ensureManifestEntry(
      manifest,
      entry.segmentId,
      providerSegments.has(entry.segmentId)
    );
  }

  return manifest;
}

export default function segmentManifestLoader(
  this: TurbopackLoaderContext<SegmentManifestLoaderConfig>,
  source: string
) {
  const callback = this.async();

  const request = parseQuery(this.resourceQuery);
  if (!request) {
    callback(null, serializeModule(parseManifestSource(source)));
    return;
  }

  const options = this.getOptions();
  const configuredSrcPaths = Array.isArray(options.srcPath)
    ? options.srcPath
    : [options.srcPath];
  const layoutFilePath = path.resolve(this.rootContext, request.layoutPath);
  const appDir = resolveAppDirForResource(this.rootContext, layoutFilePath);

  if (!appDir) {
    callback(null, serializeModule(undefined));
    return;
  }

  const inferredSegmentId = getSegmentId(layoutFilePath, appDir);
  const ownerSegment = normalizeSegmentId(inferredSegmentId);
  const expectedSegment = normalizeSegmentId(request.segmentId);

  if (ownerSegment !== expectedSegment) {
    this.emitWarning(
      new Error(
        `[next-intl] Segment manifest request mismatch for ${request.layoutPath}: expected "${expectedSegment}", got "${ownerSegment}".`
      )
    );
  }

  const srcMatcher = createSourcePathMatcher(
    this.rootContext,
    configuredSrcPaths
  );
  const dependencyGraph = new DependencyGraph({
    projectRoot: this.rootContext,
    srcMatcher,
    tsconfigPath: path.join(this.rootContext, 'tsconfig.json')
  });
  const sourceAnalyzer = new SourceAnalyzer();

  void (async () => {
    const entryFiles = await scanEntryFiles([appDir]);
    const providerSegments = await getProviderSegments(entryFiles);
    const ownershipManifest = createOwnershipManifest(
      entryFiles,
      providerSegments
    );

    const dependencies = new Set<string>();
    let hasNamespaces = false;
    let mergedNamespaces: ManifestNamespaces = {};

    for (const entry of entryFiles) {
      if (
        entry.name === 'layout' &&
        isInSegmentSubtree(ownerSegment, entry.segmentId)
      ) {
        dependencies.add(entry.filePath);
      }
    }

    for (const entry of entryFiles) {
      if (!isOwnedBySegment(ownerSegment, entry.segmentId, ownershipManifest)) {
        continue;
      }

      const graph = await dependencyGraph.getEntryGraph(entry.filePath);
      for (const dependencyPath of graph.files) {
        dependencies.add(dependencyPath);
      }

      const namespaces = await analyzeEntryNamespaces({
        entryFile: entry.filePath,
        graphAdjacency: graph.adjacency,
        sourceAnalyzer,
        srcMatcher
      });
      if (!hasTranslationUsage(namespaces)) {
        continue;
      }

      if (!hasNamespaces) {
        hasNamespaces = true;
      }

      mergedNamespaces = mergeNamespaces(mergedNamespaces, namespaces);
    }

    for (const dependencyPath of dependencies) {
      this.addDependency(dependencyPath);
    }

    this.addContextDependency(getSegmentDirectory(appDir, ownerSegment));

    callback(null, serializeModule(hasNamespaces ? mergedNamespaces : {}));
  })().catch((error) => {
    this.emitWarning(
      new Error(
        `[next-intl] Failed to infer segment manifest for "${ownerSegment}": ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    );
    callback(null, serializeModule(undefined));
  });
}
