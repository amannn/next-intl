import {createRequire} from 'module';
import path from 'path';
import {transform} from '@swc/core';
import type {ExtractorMessage} from '../types.js';
import type Logger from '../utils/Logger.js';
import {getDefaultProjectRoot} from '../utils.js';
import LRUCache from './LRUCache.js';

const require = createRequire(import.meta.url);

type StrictExtractedMessage = ExtractorMessage & {
  references: NonNullable<ExtractorMessage['references']>;
};

export default class MessageExtractor {
  private isDevelopment: boolean;
  private projectRoot: string;
  private sourceMap: boolean;
  private logger?: Logger;
  private compileCache = new LRUCache<{
    messages: Array<StrictExtractedMessage>;
    code: string;
    map?: string;
  }>(750);

  public constructor(opts: {
    isDevelopment?: boolean;
    projectRoot?: string;
    sourceMap?: boolean;
    logger?: Logger;
  }) {
    this.isDevelopment = opts.isDevelopment ?? false;
    this.projectRoot = opts.projectRoot ?? getDefaultProjectRoot();
    this.sourceMap = opts.sourceMap ?? false;
    this.logger = opts.logger;
  }

  public async extract(
    absoluteFilePath: string,
    source: string
  ): Promise<{
    messages: Array<StrictExtractedMessage>;
    code: string;
    map?: string;
  }> {
    const cacheKey = [source, absoluteFilePath].join('!');
    const cached = this.compileCache.get(cacheKey);
    if (cached) {
      void this.logger?.debug('MessageExtractor.extract() cache hit', {
        absoluteFilePath
      });
      return cached;
    }

    void this.logger?.debug('MessageExtractor.extract() starting', {
      absoluteFilePath
    });

    // Shortcut parsing if hook is not used. The Turbopack integration already
    // pre-filters this, but for webpack this feature doesn't exist, so we need
    // to do it here.
    if (!source.includes('useExtracted') && !source.includes('getExtracted')) {
      void this.logger?.debug(
        'MessageExtractor.extract() shortcut - no hooks found',
        {
          absoluteFilePath
        }
      );
      return {messages: [], code: source};
    }

    const filePath = path.relative(this.projectRoot, absoluteFilePath);
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
              {
                isDevelopment: this.isDevelopment
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
    ) as Array<ExtractorMessage>;

    // Add file path reference to each message
    const messagesWithReferences: Array<StrictExtractedMessage> = messages.map(
      (message) => ({
        ...message,
        references: [{path: filePath}]
      })
    );

    const extractionResult = {
      code: result.code,
      map: result.map,
      messages: messagesWithReferences
    };

    void this.logger?.debug('MessageExtractor.extract() completed', {
      absoluteFilePath,
      messageCount: messages.length
    });

    this.compileCache.set(cacheKey, extractionResult);
    return extractionResult;
  }
}
