import {createRequire} from 'module';
import path from 'path';
import {transform} from '@swc/core';
import {normalizePathToPosix} from '../node/utils.js';
import LRUCache from '../utils/LRUCache.js';

const require = createRequire(import.meta.url);

export type FileScanMessage =
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
    };

export type FileScanResult = {
  code: string;
  dependencies: Array<string>;
  hasUseClient: boolean;
  hasUseServer: boolean;
  map?: string;
  messages: Array<FileScanMessage>;
};

export default class FileScanner {
  private isDevelopment: boolean;
  private projectRoot: string;
  private sourceMap: boolean;
  private compileCache = new LRUCache<FileScanResult>(750);

  public constructor(opts: {
    projectRoot: string;
    isDevelopment?: boolean;
    sourceMap?: boolean;
  }) {
    this.isDevelopment = opts.isDevelopment ?? false;
    this.projectRoot = opts.projectRoot;
    this.sourceMap = opts.sourceMap ?? false;
  }

  public async scan(
    absoluteFilePath: string,
    source: string
  ): Promise<FileScanResult> {
    const cacheKey = [source, absoluteFilePath].join('!');
    const cached = this.compileCache.get(cacheKey);
    if (cached) return cached;

    const filePath = normalizePathToPosix(
      path.relative(this.projectRoot, absoluteFilePath)
    );
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
              {isDevelopment: this.isDevelopment, filePath}
            ]
          ]
        }
      },
      sourceMaps: this.sourceMap,
      sourceFileName: filePath,
      filename: filePath
    });

    const rawOutput = (result as {output?: string}).output;
    const outer =
      typeof rawOutput === 'string' ? JSON.parse(rawOutput) : rawOutput;
    const parsed =
      typeof outer?.output === 'string'
        ? JSON.parse(outer.output)
        : (outer ?? {});
    const messages = (parsed.messages ?? []) as Array<FileScanMessage>;

    const scanResult: FileScanResult = {
      code: result.code,
      dependencies: parsed.dependencies ?? [],
      hasUseClient: parsed.hasUseClient ?? false,
      hasUseServer: parsed.hasUseServer ?? false,
      map: result.map,
      messages
    };

    this.compileCache.set(cacheKey, scanResult);
    return scanResult;
  }
}
