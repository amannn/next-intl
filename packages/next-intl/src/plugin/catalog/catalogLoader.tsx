/* eslint-disable @typescript-eslint/no-unnecessary-condition -- Loader context varies (webpack/turbopack) */
import fs from 'fs/promises';
import path from 'path';
import compile from 'icu-minify/compile';
import ExtractionCompiler from '../../extractor/ExtractionCompiler.js';
import {extractorLogger} from '../../extractor/extractorLogger.js';
import type ExtractorCodec from '../../extractor/format/ExtractorCodec.js';
import {
  getFormatExtension,
  resolveCodec
} from '../../extractor/format/index.js';
import type {
  CatalogLoaderConfig,
  ExtractorMessage
} from '../../extractor/types.js';
import {setNestedProperty} from '../../extractor/utils.js';
import type {TurbopackLoaderContext} from '../types.js';

// The module scope is safe for some caching, but Next.js can
// create multiple loader instances so don't expect a singleton.
let cachedCodec: ExtractorCodec | null = null;

type CompiledMessageCacheEntry = {
  compiledMessage: unknown;
  messageValue: string;
};

const messageCacheByCatalog = new Map<
  string,
  Map<string, CompiledMessageCacheEntry>
>();

function getMessageCache(catalogId: string) {
  let cache = messageCacheByCatalog.get(catalogId);
  if (!cache) {
    cache = new Map();
    messageCacheByCatalog.set(catalogId, cache);
  }
  return cache;
}

async function getCodec(
  options: CatalogLoaderConfig,
  projectRoot: string
): Promise<ExtractorCodec> {
  if (!cachedCodec) {
    cachedCodec = await resolveCodec(options.messages.format, projectRoot);
  }
  return cachedCodec;
}

/**
 * Parses and optimizes catalog files.
 *
 * When extract enabled and this is the source locale catalog: adds
 * addContextDependency for srcPaths, runs extraction, then decodes.
 * Target locale catalogs decode only.
 *
 * Note that if we use a dynamic import like `import(`${locale}.json`)`, then
 * the loader will optimistically run for all candidates in this folder (both
 * during dev as well as at build time).
 */
export default function catalogLoader(
  this: TurbopackLoaderContext<CatalogLoaderConfig>,
  source: string
) {
  const options = this.getOptions();
  const callback = this.async();
  const extension = getFormatExtension(options.messages.format);
  const locale = path.basename(this.resourcePath, extension);
  const projectRoot = this.rootContext ?? process.cwd();

  const runExtraction =
    options.sourceLocale && options.srcPath && locale === options.sourceLocale;
  const isSourceLocale = locale === (options.sourceLocale ?? '');
  const srcPaths = runExtraction
    ? (Array.isArray(options.srcPath) ? options.srcPath : [options.srcPath])
        .filter((p): p is string => typeof p === 'string')
        .map((p) => path.resolve(projectRoot, p))
    : [];

  extractorLogger.catalogLoaderRun({
    projectRoot,
    resourcePath: this.resourcePath,
    locale,
    isSourceLocale,
    runExtraction: Boolean(runExtraction),
    srcPaths
  });

  Promise.resolve()
    .then(async () => {
      let contentToDecode = source;
      if (runExtraction && srcPaths.length > 0) {
        for (const srcPath of srcPaths) {
          this.addContextDependency?.(srcPath);
          extractorLogger.addContextDependency({projectRoot, path: srcPath});
        }
        const extractionStart = Date.now();
        extractorLogger.extractionStart({
          projectRoot,
          resourcePath: this.resourcePath
        });
        const compiler = new ExtractionCompiler(
          {
            srcPath: options.srcPath!,
            sourceLocale: options.sourceLocale!,
            messages: options.messages
          },
          {isDevelopment: false, projectRoot}
        );
        try {
          await compiler.extractAll();
        } finally {
          compiler[Symbol.dispose]();
        }
        extractorLogger.extractionEnd({
          projectRoot,
          resourcePath: this.resourcePath,
          durationMs: Date.now() - extractionStart
        });
        contentToDecode = await fs.readFile(this.resourcePath, 'utf8');
      }

      const codec = await getCodec(options, projectRoot);
      let outputString: string;

      if (options.messages.precompile) {
        const decoded = codec.decode(contentToDecode, {locale});
        const cache = getMessageCache(this.resourcePath);
        const precompiled = precompileMessages(decoded, cache);
        outputString = JSON.stringify(precompiled);
      } else {
        outputString = codec.toJSONString(contentToDecode, {locale});
      }

      // https://v8.dev/blog/cost-of-javascript-2019#json
      const result = `export default JSON.parse(${JSON.stringify(outputString)});`;

      callback(null, result);
    })
    .catch(callback);
}

/**
 * Recursively precompiles all ICU message strings in a messages object
 * using icu-minify/compile for smaller runtime bundles.
 */
function precompileMessages(
  messages: Array<ExtractorMessage>,
  cache: Map<string, CompiledMessageCacheEntry>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const cacheKeysToEvict = new Set(cache.keys());

  for (const message of messages) {
    cacheKeysToEvict.delete(message.id);
    const messageValue = message.message;

    if (Array.isArray(messageValue)) {
      throw new Error(
        `Message at \`${message.id}\` resolved to an array, but only strings are supported. See https://next-intl.dev/docs/usage/translations#arrays-of-messages`
      );
    }

    if (typeof messageValue === 'object') {
      throw new Error(
        `Message at \`${message.id}\` resolved to \`${typeof messageValue}\`, but only strings are supported. Use a \`.\` to retrieve nested messages. See https://next-intl.dev/docs/usage/translations#structuring-messages`
      );
    }

    const cachedEntry = cache.get(message.id);
    const hasCacheMatch = cachedEntry?.messageValue === messageValue;

    let compiledMessage;
    if (hasCacheMatch) {
      compiledMessage = cachedEntry.compiledMessage;
    } else {
      compiledMessage = compile(messageValue);
      cache.set(message.id, {compiledMessage, messageValue});
    }

    setNestedProperty(result, message.id, compiledMessage);
  }

  // Evict unused cache entries
  for (const cachedId of cacheKeysToEvict) {
    cache.delete(cachedId);
  }

  return result;
}
