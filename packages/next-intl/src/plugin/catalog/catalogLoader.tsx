import path from 'path';
import compile from 'icu-minify/compiler';
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

  getCodec(options, this.rootContext)
    .then((codec) => {
      const locale = path.basename(this.resourcePath, extension);
      let outputString: string;

      if (options.messages.precompile) {
        const decoded = codec.decode(source, {locale});
        const cache = getMessageCache(this.resourcePath);
        const precompiled = precompileMessages(decoded, cache);
        outputString = JSON.stringify(precompiled);
      } else {
        outputString = codec.toJSONString(source, {locale});
      }

      // https://v8.dev/blog/cost-of-javascript-2019#json
      const result = `export default JSON.parse(${JSON.stringify(outputString)});`;

      callback(null, result);
    })
    .catch(callback);
}

/**
 * Recursively precompiles all ICU message strings in a messages object
 * using icu-minify/compiler for smaller runtime bundles.
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
      console.log('cache hit', message.id);
      compiledMessage = cachedEntry.compiledMessage;
    } else {
      console.log('compile', message.id);
      compiledMessage = compile(messageValue);
      cache.set(message.id, {compiledMessage, messageValue});
    }

    setNestedProperty(result, message.id, compiledMessage);
  }

  // Evict unused cache entries
  for (const cachedId of cacheKeysToEvict) {
    console.log('evict', cachedId);
    cache.delete(cachedId);
  }

  return result;
}
