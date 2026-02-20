import fs from 'fs/promises';
import path from 'path';
import SourceFileFilter from '../extractor/source/SourceFileFilter.js';
import LRUCache from '../utils/LRUCache.js';
import createModuleResolver from './createModuleResolver.js';
import parseImports from './parseImports.js';

type EntryGraph = {
  adjacency: Map<string, Set<string>>;
  files: Set<string>;
};

type SourcePathMatcher = {
  matches(filePath: string): boolean;
};

const SUPPORTED_EXTENSIONS = new Set(
  SourceFileFilter.EXTENSIONS.map((ext) => `.${ext}`)
);

function isSourceFile(filePath: string): boolean {
  if (filePath.endsWith('.d.ts')) return false;
  return SUPPORTED_EXTENSIONS.has(path.extname(filePath));
}

const CACHE_MAX_SIZE = 250;

export default class DependencyGraph {
  private cache = new LRUCache<EntryGraph>(CACHE_MAX_SIZE);
  private projectRoot: string;
  private srcMatcher: SourcePathMatcher;
  private tsconfigPath?: string;
  private resolve: (context: string, request: string) => Promise<string | null>;

  public constructor({
    projectRoot,
    srcMatcher,
    tsconfigPath
  }: {
    projectRoot: string;
    srcMatcher: SourcePathMatcher;
    tsconfigPath?: string;
  }) {
    this.projectRoot = projectRoot;
    this.srcMatcher = srcMatcher;
    this.tsconfigPath = tsconfigPath;
    this.resolve = createModuleResolver({
      projectRoot,
      tsconfigPath: tsconfigPath ?? path.join(projectRoot, 'tsconfig.json')
    });
  }

  public clearEntries(entryFiles: Array<string>) {
    for (const entryFile of entryFiles) {
      this.cache.delete(path.normalize(entryFile));
    }
  }

  public async getEntryGraph(entryFile: string): Promise<EntryGraph> {
    const normalizedEntry = path.normalize(entryFile);
    const cached = this.cache.get(normalizedEntry);
    if (cached) return cached;

    const adjacency = new Map<string, Set<string>>();
    const files = new Set<string>();
    const visited = new Set<string>();

    const visit = async (filePath: string): Promise<void> => {
      const normalized = path.normalize(filePath);
      if (visited.has(normalized)) return;
      visited.add(normalized);
      files.add(normalized);

      if (!this.srcMatcher.matches(normalized)) return;

      let source: string;
      try {
        source = await fs.readFile(normalized, 'utf-8');
      } catch {
        return;
      }

      let imports: Array<string>;
      try {
        imports = parseImports(source);
      } catch {
        imports = [];
      }

      const context = path.dirname(normalized);
      const resolved = await Promise.all(
        imports.map((req) => this.resolve(context, req))
      );

      const children = resolved.filter(
        (res): res is string =>
          res != null && isSourceFile(res) && this.srcMatcher.matches(res)
      );

      if (!adjacency.has(normalized)) {
        adjacency.set(normalized, new Set());
      }
      for (const child of children) {
        adjacency.get(normalized)!.add(path.normalize(child));
      }

      await Promise.all(children.map((child) => visit(path.normalize(child))));
    };

    await visit(normalizedEntry);

    if (!adjacency.has(normalizedEntry)) {
      adjacency.set(normalizedEntry, new Set());
    }

    const graph = {adjacency, files};
    this.cache.set(normalizedEntry, graph);
    return graph;
  }
}
