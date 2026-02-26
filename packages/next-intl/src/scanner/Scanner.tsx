import fs from 'fs/promises';
import path from 'path';
import {compareReferences} from '../extractor/utils.js';
import createModuleResolver from '../tree-shaking/createModuleResolver.js';
import FileScanner from './FileScanner.js';
import SourceFileFilter from './SourceFileFilter.js';
import SourceFileScanner from './SourceFileScanner.js';

const SUPPORTED_EXTENSIONS = new Set(
  SourceFileFilter.EXTENSIONS.map((ext) => `.${ext}`)
);

function isSourceFile(filePath: string): boolean {
  if (filePath.endsWith('.d.ts')) return false;
  return SUPPORTED_EXTENSIONS.has(path.extname(filePath));
}

export type ScanMessage = {
  type: 'Extracted' | 'Translations';
  id: string;
  references: Array<{path: string; line: number}>;
  message?: string;
  description?: string;
};

export type ScanFileEntry = {
  dependencies: Set<string>;
  hasUseClient: boolean;
  hasUseServer: boolean;
  messages: Array<ScanMessage>;
};

export type ScanResult = Map</* absolute file path */ string, ScanFileEntry>;

export type ScannerConfig = {
  entry: string | Array<string>;
  isDevelopment: boolean;
  projectRoot: string;
  srcPaths?: Array<string>;
  tsconfigPath?: string;
};

function createSrcMatcher(
  projectRoot: string,
  srcPaths: Array<string>
): (filePath: string) => boolean {
  const roots = srcPaths.map((cur) => path.resolve(projectRoot, cur));
  return (filePath: string) =>
    roots.some((root) => SourceFileFilter.isWithinPath(filePath, root));
}

function mergeReferences(result: ScanResult): void {
  const refsByKey = new Map<
    string,
    {refs: Array<{path: string; line: number}>; seen: Set<string>}
  >();
  for (const entry of result.values()) {
    for (const m of entry.messages) {
      const key = `${m.type}:${m.id}`;
      let bucket = refsByKey.get(key);
      if (!bucket) {
        bucket = {refs: [], seen: new Set()};
        refsByKey.set(key, bucket);
      }
      for (const ref of m.references) {
        const refKey = `${ref.path}:${ref.line}`;
        if (!bucket.seen.has(refKey)) {
          bucket.seen.add(refKey);
          bucket.refs.push(ref);
        }
      }
    }
  }
  for (const entry of result.values()) {
    for (const m of entry.messages) {
      const bucket = refsByKey.get(`${m.type}:${m.id}`)!;
      m.references = bucket.refs.toSorted(compareReferences);
    }
  }
}

export default class Scanner {
  private entry: string | Array<string>;
  private fileScanner: FileScanner;
  private projectRoot: string;
  private resolve: (context: string, request: string) => Promise<string | null>;
  private srcMatcher: ((filePath: string) => boolean) | null;

  public constructor(config: ScannerConfig) {
    this.projectRoot = path.resolve(config.projectRoot);
    this.entry = Array.isArray(config.entry)
      ? config.entry.map((entry) => path.resolve(this.projectRoot, entry))
      : path.resolve(this.projectRoot, config.entry);
    this.resolve = createModuleResolver({
      projectRoot: this.projectRoot,
      tsconfigPath:
        config.tsconfigPath ?? path.join(this.projectRoot, 'tsconfig.json')
    });
    this.srcMatcher =
      config.srcPaths && config.srcPaths.length > 0
        ? createSrcMatcher(this.projectRoot, config.srcPaths)
        : null;
    this.fileScanner = new FileScanner({
      isDevelopment: config.isDevelopment,
      projectRoot: this.projectRoot,
      sourceMap: false
    });
  }

  public async scan(): Promise<ScanResult> {
    const entries = Array.isArray(this.entry) ? this.entry : [this.entry];
    const results = await Promise.all(
      entries.map((entry) => this.scanEntry(entry))
    );
    const merged = this.mergeScanResults(results);
    mergeReferences(merged);
    return merged;
  }

  private mergeScanResults(results: Array<ScanResult>): ScanResult {
    const out = new Map<string, ScanFileEntry>();
    for (const result of results) {
      for (const [file, entry] of result) {
        const existing = out.get(file);
        if (existing) {
          for (const dep of entry.dependencies) existing.dependencies.add(dep);
          existing.messages.push(...entry.messages);
        } else {
          out.set(file, {
            dependencies: new Set(entry.dependencies),
            hasUseClient: entry.hasUseClient,
            hasUseServer: entry.hasUseServer,
            messages: [...entry.messages]
          });
        }
      }
    }
    return out;
  }

  private async scanEntry(entryPath: string): Promise<ScanResult> {
    const stats = await fs.stat(entryPath).catch(() => null);
    const isDirectory = stats?.isDirectory() ?? false;

    if (isDirectory) {
      return this.scanFolder(entryPath);
    }
    return this.scanFromEntry(entryPath);
  }

  private async scanFolder(entryPath: string): Promise<ScanResult> {
    const files = await SourceFileScanner.getSourceFiles([entryPath]);
    const result = new Map<string, ScanFileEntry>();

    for (const filePath of files) {
      const normalized = path.normalize(filePath);
      let source: string;
      try {
        source = await fs.readFile(normalized, 'utf8');
      } catch {
        continue;
      }

      const output = await this.fileScanner.scan(normalized, source);

      const messages: Array<ScanMessage> = output.messages.map((cur) =>
        cur.type === 'Extracted'
          ? {
              type: 'Extracted' as const,
              id: cur.id,
              message: cur.message,
              description: cur.description,
              references: cur.references
            }
          : {
              type: 'Translations' as const,
              id: cur.id,
              references: cur.references
            }
      );

      const context = path.dirname(normalized);
      const resolved = await Promise.all(
        output.dependencies.map((req) => this.resolve(context, req))
      );
      const dependencies = new Set(
        resolved
          .filter(
            (res): res is string =>
              res != null &&
              isSourceFile(res) &&
              (!this.srcMatcher || this.srcMatcher(res))
          )
          .map((child) => path.normalize(child))
      );

      result.set(normalized, {
        dependencies,
        hasUseClient: output.hasUseClient,
        hasUseServer: output.hasUseServer,
        messages
      });
    }

    return result;
  }

  private async scanFromEntry(entryPath: string): Promise<ScanResult> {
    const normalizedEntry = path.normalize(entryPath);
    const result = new Map<string, ScanFileEntry>();
    const visited = new Set<string>();

    const visit = async (
      filePath: string,
      ancestors: Set<string>
    ): Promise<void> => {
      const normalized = path.normalize(filePath);
      if (ancestors.has(normalized)) return;
      if (visited.has(normalized)) return;
      visited.add(normalized);

      if (this.srcMatcher && !this.srcMatcher(normalized)) return;

      let source: string;
      try {
        source = await fs.readFile(normalized, 'utf8');
      } catch {
        return;
      }

      const output = await this.fileScanner.scan(normalized, source);

      const messages: Array<ScanMessage> = output.messages.map((cur) =>
        cur.type === 'Extracted'
          ? {
              type: 'Extracted' as const,
              id: cur.id,
              message: cur.message,
              description: cur.description,
              references: cur.references
            }
          : {
              type: 'Translations' as const,
              id: cur.id,
              references: cur.references
            }
      );

      const context = path.dirname(normalized);
      const resolved = await Promise.all(
        output.dependencies.map((req) => this.resolve(context, req))
      );
      const children = resolved.filter(
        (res): res is string =>
          res != null &&
          isSourceFile(res) &&
          (!this.srcMatcher || this.srcMatcher(res))
      );

      const dependencies = new Set<string>();
      const nextAncestors = new Set([...ancestors, normalized]);
      for (const child of children) {
        const normalizedChild = path.normalize(child);
        dependencies.add(normalizedChild);
        await visit(normalizedChild, nextAncestors);
      }

      result.set(normalized, {
        dependencies,
        hasUseClient: output.hasUseClient,
        hasUseServer: output.hasUseServer,
        messages
      });
    };

    await visit(normalizedEntry, new Set());

    if (!result.has(normalizedEntry)) {
      result.set(normalizedEntry, {
        dependencies: new Set(),
        hasUseClient: false,
        hasUseServer: false,
        messages: []
      });
    }

    return result;
  }
}
