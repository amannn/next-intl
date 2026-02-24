import {createRequire} from 'module';
import path from 'path';
import {transform} from '@swc/core';
import LRUCache from '../../utils/LRUCache.js';
import type {ExtractorMessage} from '../types.js';
import {getDefaultProjectRoot, normalizePathToPosix} from '../utils.js';

const require = createRequire(import.meta.url);

type StrictExtractedMessage = ExtractorMessage & {
  references: NonNullable<ExtractorMessage['references']>;
};

export default class MessageExtractor {
  private isDevelopment: boolean;
  private projectRoot: string;
  private sourceMap: boolean;
  private compileCache = new LRUCache<{
    messages: Array<StrictExtractedMessage>;
    code: string;
    map?: string;
  }>(750);

  public constructor(opts: {
    isDevelopment?: boolean;
    projectRoot?: string;
    sourceMap?: boolean;
  }) {
    this.isDevelopment = opts.isDevelopment ?? false;
    this.projectRoot = opts.projectRoot ?? getDefaultProjectRoot();
    this.sourceMap = opts.sourceMap ?? false;
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
    if (cached) return cached;

    // Shortcut parsing if hook is not used. The Turbopack integration already
    // pre-filters this, but for webpack this feature doesn't exist, so we need
    // to do it here.
    if (!source.includes('useExtracted') && !source.includes('getExtracted')) {
      return {messages: [], code: source};
    }

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

    const rawOutput = (result as {output?: string}).output;
    const outer =
      typeof rawOutput === 'string' ? JSON.parse(rawOutput) : rawOutput;
    const parsed =
      typeof outer?.output === 'string'
        ? JSON.parse(outer.output)
        : (outer ?? {});
    const messages = (parsed.messages ?? []) as Array<
      | {
          type: 'Extracted';
          id: string;
          message: string;
          description?: string;
          references: Array<{path: string; line: number}>;
        }
      | {type: 'Translations'}
    >;
    const extracted = messages
      .filter(
        (cur): cur is Extract<(typeof messages)[0], {type: 'Extracted'}> =>
          cur.type === 'Extracted'
      )
      .map((cur) => ({
        id: cur.id,
        message: cur.message,
        description: cur.description,
        references: cur.references
      }));

    const extractionResult = {
      code: result.code,
      map: result.map,
      messages: extracted
    };

    this.compileCache.set(cacheKey, extractionResult);
    return extractionResult;
  }
}
