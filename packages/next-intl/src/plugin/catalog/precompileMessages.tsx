import compile from 'icu-minify/compile';
import type ExtractorCodec from '../../extractor/format/ExtractorCodec.js';
import {setNestedProperty} from '../../node/utils.js';

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

/**
 * Recursively precompiles all ICU message strings in a messages object
 * using icu-minify/compile for smaller runtime bundles.
 */
export default function precompileMessages(
  contentToDecode: string,
  options: {
    codec: ExtractorCodec;
    locale: string;
    resourcePath: string;
  }
): string {
  const decoded = options.codec.decode(contentToDecode, {
    locale: options.locale
  });
  const cache = getMessageCache(options.resourcePath);
  const result: Record<string, unknown> = {};
  const cacheKeysToEvict = new Set(cache.keys());

  for (const message of decoded) {
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

  return JSON.stringify(result);
}
