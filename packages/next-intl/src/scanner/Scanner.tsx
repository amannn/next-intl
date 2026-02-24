import fs from 'fs/promises';
import {createRequire} from 'module';
import path from 'path';
import {transform} from '@swc/core';
import SourceFileFilter from '../extractor/source/SourceFileFilter.js';
import SourceFileScanner from '../extractor/source/SourceFileScanner.js';
import type {ExtractorMessage} from '../extractor/types.js';
import {normalizePathToPosix} from '../extractor/utils.js';
import createModuleResolver from '../tree-shaking/createModuleResolver.js';

const require = createRequire(import.meta.url);

const SUPPORTED_EXTENSIONS = new Set(
  SourceFileFilter.EXTENSIONS.map((ext) => `.${ext}`)
);

function isSourceFile(filePath: string): boolean {
  if (filePath.endsWith('.d.ts')) return false;
  return SUPPORTED_EXTENSIONS.has(path.extname(filePath));
}

type FileAnalysis = {
  hasUseClient: boolean;
  hasUseServer: boolean;
  translations: Array<{
    id: string;
    references: Array<{path: string; line: number}>;
  }>;
};

type PluginOutput = {
  messages: Array<
    | {
        type: 'Extracted';
        id: string;
        message: string;
        description?: string;
        references: Array<{path: string; line: number}>;
      }
    | {
        type: 'Translations';
        id: string;
        references: Array<{path: string; line: number}>;
      }
  >;
  dependencies: Array<string>;
  hasUseClient: boolean;
  hasUseServer: boolean;
};

export type ScannerConfig = {
  projectRoot: string;
  entry: string | Array<string>;
  srcPaths?: Array<string>;
  tsconfigPath?: string;
};

export type ScanResult = {
  files: Set<string>;
  graph: {adjacency: Map<string, Set<string>>};
  messagesByFile: Map<string, Array<ExtractorMessage>>;
  analysisByFile: Map<string, FileAnalysis>;
};

async function runPluginOnFile(
  filePath: string,
  source: string,
  projectRoot: string
): Promise<PluginOutput> {
  const filePathPosix = normalizePathToPosix(
    path.relative(projectRoot, filePath)
  );
  const isDevelopment = process.env['NODE_ENV'.trim()] === 'development';

  const result = await transform(source, {
    jsc: {
      target: 'esnext',
      parser: {
        syntax: 'typescript',
        tsx: true,
        decorators: true
      },
      experimental: {
        cacheRoot: 'node_modules/.cache/swc',
        disableBuiltinTransformsForInternalTesting: true,
        disableAllLints: true,
        plugins: [
          [
            require.resolve('next-intl-swc-plugin-extractor'),
            {isDevelopment, filePath: filePathPosix}
          ]
        ]
      }
    },
    sourceMaps: false,
    sourceFileName: filePathPosix,
    filename: filePathPosix
  });

  const rawOutput = (result as {output?: string}).output;
  const outer =
    typeof rawOutput === 'string' ? JSON.parse(rawOutput) : rawOutput;
  const parsed =
    typeof outer?.output === 'string'
      ? JSON.parse(outer.output)
      : (outer ?? {});
  return {
    messages: parsed.messages ?? [],
    dependencies: parsed.dependencies ?? [],
    hasUseClient: parsed.hasUseClient ?? false,
    hasUseServer: parsed.hasUseServer ?? false
  };
}

function createSrcMatcher(
  projectRoot: string,
  srcPaths: Array<string>
): (filePath: string) => boolean {
  const roots = srcPaths.map((cur) =>
    path.resolve(projectRoot, cur.endsWith('/') ? cur.slice(0, -1) : cur)
  );
  return (filePath: string) =>
    roots.some((root) => SourceFileFilter.isWithinPath(filePath, root));
}

export default class Scanner {
  private projectRoot: string;
  private entry: string | Array<string>;
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
  }

  public async scan(): Promise<ScanResult> {
    const entries = Array.isArray(this.entry) ? this.entry : [this.entry];
    const results = await Promise.all(
      entries.map((entry) => this.scanEntry(entry))
    );
    return this.mergeScanResults(results);
  }

  private mergeScanResults(results: Array<ScanResult>): ScanResult {
    const files = new Set<string>();
    const adjacency = new Map<string, Set<string>>();
    const messagesByFile = new Map<string, Array<ExtractorMessage>>();
    const analysisByFile = new Map<string, FileAnalysis>();
    for (const result of results) {
      for (const file of result.files) files.add(file);
      for (const [file, deps] of result.graph.adjacency) {
        adjacency.set(file, new Set(deps));
      }
      for (const [file, messages] of result.messagesByFile) {
        messagesByFile.set(file, messages);
      }
      for (const [file, analysis] of result.analysisByFile) {
        analysisByFile.set(file, analysis);
      }
    }

    return {
      files,
      graph: {adjacency},
      messagesByFile,
      analysisByFile
    };
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
    const adjacency = new Map<string, Set<string>>();
    const messagesByFile = new Map<string, Array<ExtractorMessage>>();
    const analysisByFile = new Map<string, FileAnalysis>();

    for (const filePath of files) {
      const normalized = path.normalize(filePath);
      let source: string;
      try {
        source = await fs.readFile(normalized, 'utf8');
      } catch {
        continue;
      }

      const output = await runPluginOnFile(
        normalized,
        source,
        this.projectRoot
      );

      const extracted = output.messages
        .filter(
          (
            cur
          ): cur is Extract<(typeof output.messages)[0], {type: 'Extracted'}> =>
            cur.type === 'Extracted'
        )
        .map((cur) => ({
          id: cur.id,
          message: cur.message,
          description: cur.description,
          references: cur.references
        }));
      if (extracted.length > 0) {
        messagesByFile.set(normalized, extracted);
      }

      const translations = output.messages
        .filter(
          (
            cur
          ): cur is Extract<
            (typeof output.messages)[0],
            {type: 'Translations'}
          > => cur.type === 'Translations'
        )
        .map((cur) => ({
          id: cur.id,
          references: cur.references
        }));
      analysisByFile.set(normalized, {
        translations,
        hasUseClient: output.hasUseClient,
        hasUseServer: output.hasUseServer
      });

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

      if (!adjacency.has(normalized)) {
        adjacency.set(normalized, new Set());
      }
      for (const child of children) {
        adjacency.get(normalized)!.add(path.normalize(child));
      }
    }

    return {
      files,
      graph: {adjacency},
      messagesByFile,
      analysisByFile
    };
  }

  private async scanFromEntry(entryPath: string): Promise<ScanResult> {
    const normalizedEntry = path.normalize(entryPath);
    const adjacency = new Map<string, Set<string>>();
    const files = new Set<string>();
    const messagesByFile = new Map<string, Array<ExtractorMessage>>();
    const analysisByFile = new Map<string, FileAnalysis>();
    const visited = new Set<string>();

    const visit = async (
      filePath: string,
      ancestors: Set<string>
    ): Promise<void> => {
      const normalized = path.normalize(filePath);
      if (ancestors.has(normalized)) return;
      if (visited.has(normalized)) return;
      visited.add(normalized);
      files.add(normalized);

      if (this.srcMatcher && !this.srcMatcher(normalized)) return;

      let source: string;
      try {
        source = await fs.readFile(normalized, 'utf8');
      } catch {
        return;
      }

      const output = await runPluginOnFile(
        normalized,
        source,
        this.projectRoot
      );

      const extracted = output.messages
        .filter(
          (
            cur
          ): cur is Extract<(typeof output.messages)[0], {type: 'Extracted'}> =>
            cur.type === 'Extracted'
        )
        .map((cur) => ({
          id: cur.id,
          message: cur.message,
          description: cur.description,
          references: cur.references
        }));
      if (extracted.length > 0) {
        messagesByFile.set(normalized, extracted);
      }

      const translations = output.messages
        .filter(
          (
            cur
          ): cur is Extract<
            (typeof output.messages)[0],
            {type: 'Translations'}
          > => cur.type === 'Translations'
        )
        .map((cur) => ({
          id: cur.id,
          references: cur.references
        }));
      analysisByFile.set(normalized, {
        translations,
        hasUseClient: output.hasUseClient,
        hasUseServer: output.hasUseServer
      });

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

      if (!adjacency.has(normalized)) {
        adjacency.set(normalized, new Set());
      }
      const nextAncestors = new Set([...ancestors, normalized]);
      for (const child of children) {
        const normalizedChild = path.normalize(child);
        adjacency.get(normalized)!.add(normalizedChild);
        await visit(normalizedChild, nextAncestors);
      }
    };

    await visit(normalizedEntry, new Set());

    if (!adjacency.has(normalizedEntry)) {
      adjacency.set(normalizedEntry, new Set());
    }

    return {
      files,
      graph: {adjacency},
      messagesByFile,
      analysisByFile
    };
  }
}
