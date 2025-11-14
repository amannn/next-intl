import path from 'path';
import {transform} from '@swc/core';
import type {ExtractedMessage} from '../types.js';
import LRUCache from './LRUCache.js';

type StrictExtractedMessage = ExtractedMessage & {
  references: NonNullable<ExtractedMessage['references']>;
};

export default class MessageExtractor {
  private static readonly NAMESPACE_SEPARATOR = '.';

  private isDevelopment: boolean;
  private projectRoot: string;
  private sourceMap: boolean;
  private compileCache = new LRUCache<{
    messages: Array<StrictExtractedMessage>;
    code: string;
    map?: string;
  }>(750);

  constructor(opts: {
    isDevelopment: boolean;
    projectRoot: string;
    sourceMap?: boolean;
  }) {
    this.isDevelopment = opts.isDevelopment;
    this.projectRoot = opts.projectRoot;
    this.sourceMap = opts.sourceMap ?? false;
  }

  async processFileContent(
    absoluteFilePath: string,
    source: string
  ): Promise<{
    messages: Array<StrictExtractedMessage>;
    code: string;
    map?: string;
  }> {
    const cacheKey = source;
    const cached = this.compileCache.get(cacheKey);
    if (cached) return cached;

    // Shortcut parsing if hook is not used. The Turbopack integration already
    // pre-filters this, but for webpack this feature doesn't exist, so we need
    // to do it here.
    if (!source.includes('useExtracted') && !source.includes('getExtracted')) {
      return {messages: [], code: source};
    }

    const relativeFilePath = path.relative(this.projectRoot, absoluteFilePath);
    const processResult = await this.processWithTransform(
      source,
      absoluteFilePath,
      relativeFilePath
    );

    const finalResult = (
      processResult.code ? processResult : {...processResult, code: source}
    ) as {
      messages: Array<StrictExtractedMessage>;
      code: string;
      map?: string;
    };

    this.compileCache.set(cacheKey, finalResult);
    return finalResult;
  }

  private async processWithTransform(
    source: string,
    absoluteFilePath: string,
    filePath: string
  ): Promise<{
    messages: Array<StrictExtractedMessage>;
    code?: string;
    map?: string;
  }> {
    // TODO: Depend on this package and use require.resolve to get the path
    const swcPluginPath = path.join(
      process.cwd(),
      'packages',
      'swc-plugin',
      'swc_plugin_next_intl.wasm'
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
          disableBuiltinTransformsForInternalTesting: true,
          disableAllLints: true,
          plugins: [
            [
              swcPluginPath,
              {
                isDevelopment: this.isDevelopment,
                filePath
              }
            ]
          ]
        }
      },
      sourceMaps: this.sourceMap,
      sourceFileName: filePath,
      filename: filePath
    });

    // TODO: Improve the typing of @swc/core
    const output = (result as any).output as string;
    const messages = JSON.parse(
      JSON.parse(output).results
    ) as Array<StrictExtractedMessage>;

    return {
      messages,
      code: result.code,
      map: result.map
    };
  }
}
