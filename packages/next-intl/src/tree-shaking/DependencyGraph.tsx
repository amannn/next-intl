import dependencyTree from 'dependency-tree';

type EntryGraph = {
  adjacency: Map<string, Set<string>>;
  files: Set<string>;
};

type SourcePathMatcher = {
  matches(filePath: string): boolean;
};

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

export default class DependencyGraph {
  private cache = new Map<string, EntryGraph>();
  private projectRoot: string;
  private srcMatcher: SourcePathMatcher;
  private tsconfigPath?: string;

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
  }

  public clearEntries(entryFiles: Array<string>) {
    for (const entryFile of entryFiles) {
      this.cache.delete(entryFile);
    }
  }

  public async getEntryGraph(entryFile: string): Promise<EntryGraph> {
    const cached = this.cache.get(entryFile);
    if (cached) return cached;

    const tree = dependencyTree({
      directory: this.projectRoot,
      filename: entryFile,
      filter: (filePath: string) => this.srcMatcher.matches(filePath),
      nodeModulesConfig: {entry: 'module'},
      tsConfig: this.tsconfigPath
    }) as Record<string, any>;
    const adjacency =
      flattenDependencyTree(tree) ?? new Map<string, Set<string>>();

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
