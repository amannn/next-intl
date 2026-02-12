import fs from 'fs/promises';
import {createRequire} from 'module';
import path from 'path';
import type SourceAnalyzer from './SourceAnalyzer.js';

type EntryGraph = {
  adjacency: Map<string, Set<string>>;
  files: Set<string>;
  resolutions: Map<string, Map<string, string>>;
};

type SourcePathMatcher = {
  matches(filePath: string): boolean;
};

type ParsedTsConfig = {
  baseUrlAbs?: string;
  paths: Record<string, Array<string>>;
};

const RESOLVE_EXTENSIONS = [
  '.cjs',
  '.cts',
  '.js',
  '.jsx',
  '.json',
  '.mjs',
  '.mts',
  '.ts',
  '.tsx'
];
const require = createRequire(import.meta.url);

function tryResolveModule(
  modulePath: string,
  fromDir: string
): string | undefined {
  try {
    return require.resolve(modulePath, {paths: [fromDir]});
  } catch {
    return undefined;
  }
}

function mergeTsConfig(
  base: ParsedTsConfig | undefined,
  override: ParsedTsConfig | undefined
): ParsedTsConfig | undefined {
  if (!base) return override;
  if (!override) return base;
  return {
    baseUrlAbs: override.baseUrlAbs ?? base.baseUrlAbs,
    paths: {
      ...base.paths,
      ...override.paths
    }
  };
}

function stripJsonComments(input: string): string {
  return input
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

async function readJsonFile(filePath: string): Promise<unknown> {
  const source = await fs.readFile(filePath, 'utf8');
  try {
    return JSON.parse(source) as unknown;
  } catch {
    return JSON.parse(stripJsonComments(source)) as unknown;
  }
}

function withJsonExtension(filePath: string): string {
  return path.extname(filePath) ? filePath : `${filePath}.json`;
}

function resolveExtendsPath(
  extendsValue: string,
  fromDir: string
): string | undefined {
  if (extendsValue.startsWith('.') || extendsValue.startsWith('/')) {
    return withJsonExtension(path.resolve(fromDir, extendsValue));
  }

  return (
    tryResolveModule(extendsValue, fromDir) ??
    tryResolveModule(withJsonExtension(extendsValue), fromDir) ??
    tryResolveModule(`${extendsValue}/tsconfig.json`, fromDir)
  );
}

function readPaths(value: unknown): ParsedTsConfig['paths'] | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  const result: ParsedTsConfig['paths'] = {};
  for (const [key, rawTarget] of Object.entries(value)) {
    if (typeof rawTarget === 'string') {
      result[key] = [rawTarget];
      continue;
    }
    if (Array.isArray(rawTarget)) {
      const targets = rawTarget.filter(
        (target): target is string => typeof target === 'string'
      );
      if (targets.length > 0) {
        result[key] = targets;
      }
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

async function parseTsConfig(
  tsconfigPath: string,
  visited: Set<string>
): Promise<ParsedTsConfig | undefined> {
  const normalizedPath = path.resolve(tsconfigPath);
  if (visited.has(normalizedPath)) {
    return undefined;
  }
  visited.add(normalizedPath);

  let config: unknown;
  try {
    config = await readJsonFile(normalizedPath);
  } catch {
    return undefined;
  }

  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return undefined;
  }

  const configDir = path.dirname(normalizedPath);
  const extendsValue =
    typeof (config as Record<string, unknown>).extends === 'string'
      ? ((config as Record<string, unknown>).extends as string)
      : undefined;

  let baseConfig: ParsedTsConfig | undefined;
  if (extendsValue) {
    const extendsPath = resolveExtendsPath(extendsValue, configDir);
    if (extendsPath) {
      baseConfig = await parseTsConfig(extendsPath, visited);
    }
  }

  const compilerOptions =
    (config as Record<string, unknown>).compilerOptions &&
    typeof (config as Record<string, unknown>).compilerOptions === 'object' &&
    !Array.isArray((config as Record<string, unknown>).compilerOptions)
      ? ((config as Record<string, unknown>).compilerOptions as Record<
          string,
          unknown
        >)
      : {};

  const paths = readPaths(compilerOptions.paths) ?? {};
  const currentConfig: ParsedTsConfig = {
    baseUrlAbs:
      typeof compilerOptions.baseUrl === 'string'
        ? path.resolve(configDir, compilerOptions.baseUrl)
        : Object.keys(paths).length > 0
          ? configDir
          : undefined,
    paths
  };

  return mergeTsConfig(baseConfig, currentConfig);
}

function splitPattern(pattern: string): {
  hasWildcard: boolean;
  prefix: string;
  suffix: string;
} {
  const wildcardIndex = pattern.indexOf('*');
  if (wildcardIndex === -1) {
    return {hasWildcard: false, prefix: pattern, suffix: ''};
  }

  return {
    hasWildcard: true,
    prefix: pattern.slice(0, wildcardIndex),
    suffix: pattern.slice(wildcardIndex + 1)
  };
}

function matchPattern(
  pattern: string,
  source: string
): {matched: boolean; wildcardMatch: string} {
  const {hasWildcard, prefix, suffix} = splitPattern(pattern);

  if (!hasWildcard) {
    return {
      matched: source === pattern,
      wildcardMatch: ''
    };
  }

  if (!source.startsWith(prefix) || !source.endsWith(suffix)) {
    return {matched: false, wildcardMatch: ''};
  }

  const start = prefix.length;
  const end = source.length - suffix.length;
  if (end < start) {
    return {matched: false, wildcardMatch: ''};
  }

  return {matched: true, wildcardMatch: source.slice(start, end)};
}

function applyWildcard(pattern: string, value: string): string {
  const {hasWildcard, prefix, suffix} = splitPattern(pattern);
  if (!hasWildcard) {
    return pattern;
  }

  return `${prefix}${value}${suffix}`;
}

function getResolutionCandidates(basePath: string): Array<string> {
  const resolvedBasePath = path.resolve(basePath);
  const candidates = new Set<string>();
  const hasExtension = path.extname(resolvedBasePath) !== '';
  candidates.add(path.normalize(resolvedBasePath));

  if (!hasExtension) {
    for (const extension of RESOLVE_EXTENSIONS) {
      candidates.add(path.normalize(`${resolvedBasePath}${extension}`));
      candidates.add(
        path.normalize(path.join(resolvedBasePath, `index${extension}`))
      );
    }
  }

  return Array.from(candidates);
}

function isRelativeOrAbsoluteImport(source: string): boolean {
  return source.startsWith('.') || source.startsWith('/');
}

async function fileExists(
  filePath: string,
  cache: Map<string, boolean>
): Promise<boolean> {
  const cached = cache.get(filePath);
  if (cached != null) {
    return cached;
  }

  try {
    const stat = await fs.stat(filePath);
    const exists = stat.isFile();
    cache.set(filePath, exists);
    return exists;
  } catch {
    cache.set(filePath, false);
    return false;
  }
}

async function resolveFromCandidates(
  candidates: Array<string>,
  fileExistsCache: Map<string, boolean>,
  srcMatcher: SourcePathMatcher
): Promise<string | undefined> {
  for (const candidate of candidates) {
    if (!srcMatcher.matches(candidate)) {
      continue;
    }
    if (await fileExists(candidate, fileExistsCache)) {
      return candidate;
    }
  }

  return undefined;
}

export default class DependencyGraph {
  private cache = new Map<string, EntryGraph>();
  private fileExistsCache = new Map<string, boolean>();
  private importResolutionCache = new Map<string, string | undefined>();
  private sourceAnalyzer: SourceAnalyzer;
  private srcMatcher: SourcePathMatcher;
  private tsconfigPromise: Promise<ParsedTsConfig | undefined> | undefined;
  private tsconfigPath?: string;

  public constructor({
    sourceAnalyzer,
    srcMatcher,
    tsconfigPath
  }: {
    sourceAnalyzer: SourceAnalyzer;
    srcMatcher: SourcePathMatcher;
    tsconfigPath?: string;
  }) {
    this.sourceAnalyzer = sourceAnalyzer;
    this.srcMatcher = srcMatcher;
    this.tsconfigPath = tsconfigPath;
  }

  public clearEntries(entryFiles: Array<string>) {
    for (const entryFile of entryFiles) {
      this.cache.delete(entryFile);
    }

    // Avoid stale resolution results when files are edited, moved or deleted.
    this.fileExistsCache.clear();
    this.importResolutionCache.clear();
    this.tsconfigPromise = undefined;
  }

  private getTsConfig(): Promise<ParsedTsConfig | undefined> {
    if (!this.tsconfigPath) {
      return Promise.resolve(undefined);
    }

    if (!this.tsconfigPromise) {
      this.tsconfigPromise = parseTsConfig(this.tsconfigPath, new Set());
    }

    return this.tsconfigPromise;
  }

  private async resolveImport(
    filePath: string,
    source: string
  ): Promise<string | undefined> {
    const cacheKey = `${filePath}:${source}`;
    const cached = this.importResolutionCache.get(cacheKey);
    if (cached !== undefined || this.importResolutionCache.has(cacheKey)) {
      return cached;
    }

    let resolved: string | undefined;

    if (isRelativeOrAbsoluteImport(source)) {
      const basePath = source.startsWith('/')
        ? source
        : path.resolve(path.dirname(filePath), source);
      resolved = await resolveFromCandidates(
        getResolutionCandidates(basePath),
        this.fileExistsCache,
        this.srcMatcher
      );
      this.importResolutionCache.set(cacheKey, resolved);
      return resolved;
    }

    const tsconfig = await this.getTsConfig();
    const tsPaths = tsconfig?.paths ?? {};
    const tsBaseUrl = tsconfig?.baseUrlAbs;
    let matchedPathAlias = false;

    if (tsBaseUrl) {
      for (const [pattern, targets] of Object.entries(tsPaths)) {
        const {matched, wildcardMatch} = matchPattern(pattern, source);
        if (!matched) {
          continue;
        }

        matchedPathAlias = true;
        const candidates = targets.flatMap((target) =>
          getResolutionCandidates(
            path.resolve(tsBaseUrl, applyWildcard(target, wildcardMatch))
          )
        );
        resolved = await resolveFromCandidates(
          candidates,
          this.fileExistsCache,
          this.srcMatcher
        );
        if (resolved) {
          this.importResolutionCache.set(cacheKey, resolved);
          return resolved;
        }
      }
    }

    if (!matchedPathAlias && tsBaseUrl) {
      resolved = await resolveFromCandidates(
        getResolutionCandidates(path.resolve(tsBaseUrl, source)),
        this.fileExistsCache,
        this.srcMatcher
      );
    }

    if (!resolved) {
      const resolvedPackagePath = tryResolveModule(
        source,
        path.dirname(filePath)
      );
      if (
        resolvedPackagePath &&
        this.srcMatcher.matches(resolvedPackagePath) &&
        (await fileExists(resolvedPackagePath, this.fileExistsCache))
      ) {
        resolved = path.normalize(resolvedPackagePath);
      }
    }

    this.importResolutionCache.set(cacheKey, resolved);
    return resolved;
  }

  public async getEntryGraph(entryFile: string): Promise<EntryGraph> {
    const cached = this.cache.get(entryFile);
    if (cached) return cached;

    const normalizedEntryFile = path.resolve(entryFile);
    const adjacency = new Map<string, Set<string>>();
    const files = new Set<string>();
    const queue: Array<string> = [normalizedEntryFile];
    const resolutions = new Map<string, Map<string, string>>();

    while (queue.length > 0) {
      const file = path.resolve(queue.shift()!);
      if (files.has(file)) {
        continue;
      }
      files.add(file);
      adjacency.set(file, adjacency.get(file) ?? new Set());

      if (!this.srcMatcher.matches(file)) {
        continue;
      }

      const analysis = await this.sourceAnalyzer.analyzeFile(file);
      const fileResolutions = new Map<string, string>();
      resolutions.set(file, fileResolutions);

      for (const reference of analysis.dependencyReferences) {
        const resolvedFile = await this.resolveImport(file, reference.source);
        if (!resolvedFile) {
          continue;
        }

        fileResolutions.set(reference.source, resolvedFile);
        let deps = adjacency.get(file);
        if (!deps) {
          deps = new Set<string>();
          adjacency.set(file, deps);
        }
        deps.add(resolvedFile);
        queue.push(resolvedFile);
      }
    }

    if (!adjacency.has(normalizedEntryFile)) {
      adjacency.set(normalizedEntryFile, new Set());
    }

    const graph = {adjacency, files, resolutions};
    this.cache.set(entryFile, graph);
    return graph;
  }
}
