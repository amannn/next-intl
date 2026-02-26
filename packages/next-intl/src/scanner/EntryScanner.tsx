import fs from 'fs/promises';
import path from 'path';
import type {ExtractorMessageReference} from '../extractor/types.js';
import {compareReferences} from '../extractor/utils.js';
import Instrumentation from '../instrumentation/index.js';
import FileScanner, {type FileScanMessage} from './FileScanner.js';
import SourceFileFilter from './SourceFileFilter.js';
import SourceFileScanner from './SourceFileScanner.js';
import createModuleResolver from './createModuleResolver.js';

export type FileScanResult = {
  dependencies: Set<string>;
  hasUseClient: boolean;
  hasUseServer: boolean;
  messages: Array<FileScanMessage>;
};

export type EntryScanResult = Map<
  /* absolute file path */ string,
  FileScanResult
>;

export type ScannerConfig = {
  entry: string | Array<string>;
  isDevelopment: boolean;
  projectRoot: string;
  srcPaths?: Array<string>;
  tsconfigPath?: string;
};

export default class EntryScanner {
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
        ? this.createSrcMatcher(this.projectRoot, config.srcPaths)
        : null;
    this.fileScanner = new FileScanner({
      isDevelopment: config.isDevelopment,
      projectRoot: this.projectRoot,
      sourceMap: false
    });
  }

  public async scan(): Promise<EntryScanResult> {
    using I = new Instrumentation();
    const entries = Array.isArray(this.entry) ? this.entry : [this.entry];
    const entryRelative = entries
      .map((entry) => path.relative(this.projectRoot, entry))
      .join(', ');

    I.start('[EntryScanner.scan]');

    const results = await Promise.all(
      entries.map((entry) => this.scanEntry(entry))
    );
    const merged = this.mergeScanResults(results);
    this.mergeReferences(merged);

    I.end(
      '[EntryScanner.scan]',
      `${entryRelative}: ${merged.size} files scanned, ${merged.size} messages extracted`
    );
    return merged;
  }

  private createSrcMatcher(
    projectRoot: string,
    srcPaths: Array<string>
  ): (filePath: string) => boolean {
    const roots = srcPaths.map((cur) => path.resolve(projectRoot, cur));
    return (filePath: string) =>
      roots.some((root) => SourceFileFilter.isWithinPath(filePath, root));
  }

  private async resolveDependencies(
    context: string,
    rawDeps: Array<string>
  ): Promise<Array<string>> {
    const resolved = await Promise.all(
      rawDeps.map((req) => this.resolve(context, req))
    );
    return resolved
      .filter(
        (res): res is string =>
          res != null &&
          SourceFileFilter.isSourceFile(res) &&
          (!this.srcMatcher || this.srcMatcher(res))
      )
      .map((child) => path.normalize(child));
  }

  private mergeReferences(result: EntryScanResult): void {
    const refsByKey = new Map<
      string,
      {refs: Array<ExtractorMessageReference>; seen: Set<string>}
    >();
    for (const entry of result.values()) {
      for (const message of entry.messages) {
        const key = `${message.type}:${message.id}`;
        let bucket = refsByKey.get(key);
        if (!bucket) {
          bucket = {refs: [], seen: new Set()};
          refsByKey.set(key, bucket);
        }
        for (const ref of message.references) {
          const refKey = `${ref.path}:${ref.line}`;
          if (!bucket.seen.has(refKey)) {
            bucket.seen.add(refKey);
            bucket.refs.push(ref);
          }
        }
      }
    }
    for (const entry of result.values()) {
      for (const message of entry.messages) {
        const bucket = refsByKey.get(`${message.type}:${message.id}`)!;
        message.references = bucket.refs.toSorted(compareReferences);
      }
    }
  }

  private mergeScanResults(results: Array<EntryScanResult>): EntryScanResult {
    const out = new Map<string, FileScanResult>();
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

  private async scanEntry(entryPath: string): Promise<EntryScanResult> {
    const stats = await fs.stat(entryPath).catch(() => null);
    const isDirectory = stats?.isDirectory() ?? false;

    if (isDirectory) {
      return this.scanFolder(entryPath);
    }
    return this.scanFromEntry(entryPath);
  }

  private async scanFolder(entryPath: string): Promise<EntryScanResult> {
    const files = await SourceFileScanner.getSourceFiles([entryPath]);
    const result = new Map<string, FileScanResult>();

    for (const filePath of files) {
      const normalized = path.normalize(filePath);
      let source: string;
      try {
        source = await fs.readFile(normalized, 'utf8');
      } catch {
        continue;
      }

      const output = await this.fileScanner.scan(normalized, source);

      const dependencies = new Set(
        await this.resolveDependencies(
          path.dirname(normalized),
          output.dependencies
        )
      );

      result.set(normalized, {
        dependencies,
        hasUseClient: output.hasUseClient,
        hasUseServer: output.hasUseServer,
        messages: output.messages
      });
    }

    return result;
  }

  private async scanFromEntry(entryPath: string): Promise<EntryScanResult> {
    const normalizedEntry = path.normalize(entryPath);
    const result = new Map<string, FileScanResult>();
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

      const children = await this.resolveDependencies(
        path.dirname(normalized),
        output.dependencies
      );

      const dependencies = new Set<string>();
      const nextAncestors = new Set([...ancestors, normalized]);
      for (const child of children) {
        dependencies.add(child);
        await visit(child, nextAncestors);
      }

      result.set(normalized, {
        dependencies,
        hasUseClient: output.hasUseClient,
        hasUseServer: output.hasUseServer,
        messages: output.messages
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
