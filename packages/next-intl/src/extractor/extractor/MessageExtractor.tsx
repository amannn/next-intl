import {createRequire} from 'module';
import path from 'path';
import crypto from 'node:crypto';
import {transform} from '@swc/core';
import type {SourceExtractedMessage} from '../types.js';
import {getDefaultProjectRoot, normalizePathToPosix} from '../utils.js';
import LRUCache from './LRUCache.js';

function generateKey(message: string, description?: string | null): string {
  // Match Rust: check if description exists AND is non-empty
  const input =
    description && description.length > 0
      ? `${message}:${description}`
      : message;

  // Match Rust: SHA-512
  const hash = crypto.createHash('sha512').update(input, 'utf8').digest();

  // Match Rust: URL_SAFE_NO_PAD base64 (using base64url and stripping standard padding '=')
  const base64Url = hash
    .toString('base64url') // Uses URL-safe alphabet (-, _)
    .replace(/=/g, ''); // NO_PAD

  // Match Rust: slice first 6 characters
  return base64Url.slice(0, 6);
}

const require = createRequire(import.meta.url);

export default class MessageExtractor {
  private isDevelopment: boolean;
  private projectRoot: string;
  private sourceMap: boolean;
  private compileCache = new LRUCache<{
    messages: Array<SourceExtractedMessage>;
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
    messages: Array<SourceExtractedMessage>;
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
      // Is converted into a relative path by Next.js when
      // the final source map is generated
      sourceFileName: absoluteFilePath,
      filename: filePath
    });

    // TODO: Improve the typing of @swc/core
    const output = (result as any).output as string;
    // The plugin emits a tagged union of extracted messages and
    // `useTranslations` usages; this extractor only consumes the former.
    const messages = (
      JSON.parse(JSON.parse(output).results) as Array<
        {
          type: 'extracted' | 'translation';
          ranges?: {id?: unknown};
        } & SourceExtractedMessage
      >
    )
      .filter((item) => item.type === 'extracted')
      .map((item) => {
        const hasExplicitId = Boolean(item.ranges?.id);
        const id = hasExplicitId
          ? item.id
          : generateKey(item.message, item.description);

        return {
          id,
          message: item.message,
          description: item.description,
          reference: item.reference
        };
      });

    const extractionResult = {
      code: result.code,
      map: result.map,
      messages
    };

    this.compileCache.set(cacheKey, extractionResult);
    return extractionResult;
  }
}
