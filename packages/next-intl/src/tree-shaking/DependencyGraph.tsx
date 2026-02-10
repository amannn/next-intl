import fs from 'fs/promises';
import path from 'path';
import type SourceAnalyzer from './SourceAnalyzer.js';
import loadDependencyTree from './dependencyTreeLoader.js';

type EntryGraph = {
  adjacency: Map<string, Set<string>>;
  files: Set<string>;
};

type SourcePathMatcher = {
  matches(filePath: string): boolean;
};

const DEFAULT_EXTENSIONS = ['.cjs', '.js', '.jsx', '.mjs', '.ts', '.tsx'];

function flattenDependencyTree(tree: Record<string, any> | null) {
  if (!tree) return null;

  const map = new Map<string, Set<string>>();

  function ensure(key: string) {
    if (!map.has(key)) {
      map.set(key, new Set());
    }
  }

  function walk(parent: string, children?: Record<string, any>) {
    if (!children) return;
    for (const [child, nested] of Object.entries(children)) {
      ensure(parent);
      ensure(child);
      map.get(parent)!.add(child);
      walk(child, nested as Record<string, any>);
    }
  }

  for (const [root, children] of Object.entries(tree)) {
    ensure(root);
    walk(root, children as Record<string, any>);
  }

  return map;
}

function resolveWithExtensions(base: string): Array<string> {
  const candidates: Array<string> = [];
  for (const ext of DEFAULT_EXTENSIONS) {
    candidates.push(`${base}${ext}`);
  }
  for (const ext of DEFAULT_EXTENSIONS) {
    candidates.push(path.join(base, `index${ext}`));
  }
  return candidates;
}

async function resolveImport(
  specifier: string,
  fromFile: string,
  projectRoot: string
): Promise<string | null> {
  const fromDir = path.dirname(fromFile);
  const tryPaths: Array<string> = [];

  if (specifier.startsWith('./') || specifier.startsWith('../')) {
    const base = path.resolve(fromDir, specifier);
    tryPaths.push(base);
    tryPaths.push(...resolveWithExtensions(base));
  } else if (specifier.startsWith('@/')) {
    const base = path.resolve(projectRoot, 'src', specifier.slice(2));
    tryPaths.push(base);
    tryPaths.push(...resolveWithExtensions(base));
  } else {
    return null;
  }

  for (const candidate of tryPaths) {
    try {
      const stats = await fs.stat(candidate);
      if (stats.isFile()) return candidate;
    } catch {
      continue;
    }
  }

  return null;
}

async function buildFallbackGraph(
  entryFile: string,
  projectRoot: string,
  sourceAnalyzer: SourceAnalyzer,
  srcMatcher: SourcePathMatcher
): Promise<Map<string, Set<string>>> {
  const adjacency = new Map<string, Set<string>>();
  const queue: Array<string> = [entryFile];
  const visited = new Set<string>();

  function ensure(key: string) {
    if (!adjacency.has(key)) {
      adjacency.set(key, new Set());
    }
  }

  while (queue.length > 0) {
    const file = queue.shift()!;
    if (visited.has(file)) continue;
    visited.add(file);
    ensure(file);

    const analysis = await sourceAnalyzer.analyzeFile(file);
    for (const specifier of analysis.imports) {
      const resolved = await resolveImport(specifier, file, projectRoot);
      if (!resolved) continue;
      if (!srcMatcher.matches(resolved)) continue;
      ensure(resolved);
      adjacency.get(file)!.add(resolved);
      if (!visited.has(resolved)) {
        queue.push(resolved);
      }
    }
  }

  return adjacency;
}

export default class DependencyGraph {
  private cache = new Map<string, EntryGraph>();
  private dependencyTree = loadDependencyTree();
  private projectRoot: string;
  private sourceAnalyzer: SourceAnalyzer;
  private srcMatcher: SourcePathMatcher;
  private tsconfigPath?: string;

  public constructor({
    projectRoot,
    sourceAnalyzer,
    srcMatcher,
    tsconfigPath
  }: {
    projectRoot: string;
    sourceAnalyzer: SourceAnalyzer;
    srcMatcher: SourcePathMatcher;
    tsconfigPath?: string;
  }) {
    this.projectRoot = projectRoot;
    this.sourceAnalyzer = sourceAnalyzer;
    this.srcMatcher = srcMatcher;
    this.tsconfigPath = tsconfigPath;
  }

  public clearEntries(entryFiles: Array<string>) {
    for (const entryFile of entryFiles) {
      this.cache.delete(entryFile);
    }
  }

  public async getEntryGraph(entryFile: string): Promise<EntryGraph> {
    const cached = this.cache.get(entryFile);
    if (cached) return cached;

    let adjacency: Map<string, Set<string>> | null = null;

    if (this.dependencyTree) {
      try {
        const tree = this.dependencyTree({
          directory: this.projectRoot,
          extensions: DEFAULT_EXTENSIONS,
          filename: entryFile,
          filter: (filePath: string) => this.srcMatcher.matches(filePath),
          nodeModulesConfig: {entry: 'module'},
          tsConfig: this.tsconfigPath
        }) as Record<string, any>;
        adjacency = flattenDependencyTree(tree);
      } catch {
        adjacency = null;
      }
    }

    if (!adjacency) {
      adjacency = await buildFallbackGraph(
        entryFile,
        this.projectRoot,
        this.sourceAnalyzer,
        this.srcMatcher
      );
    }

    if (!adjacency.has(entryFile)) {
      adjacency.set(entryFile, new Set());
    }

    const files = new Set<string>();
    for (const [parent, children] of adjacency.entries()) {
      files.add(parent);
      for (const child of children) {
        files.add(child);
      }
    }

    const graph = {adjacency, files};
    this.cache.set(entryFile, graph);
    return graph;
  }
}
