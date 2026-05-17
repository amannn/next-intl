import path from 'path';
import compile from 'icu-minify/compile';
import type ExtractorCodec from './format/ExtractorCodec.js';
import {getFormatExtension, resolveCodec} from './format/index.js';
import type {CatalogLoaderConfig, ExtractorMessage} from './types.js';
import {setNestedProperty} from './utils.js';

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

const codecCacheByProjectRoot = new Map<
  string,
  Promise<ExtractorCodec>
>();

async function getCodec(
  options: CatalogLoaderConfig,
  projectRoot: string
): Promise<ExtractorCodec> {
  const cacheKey = projectRoot + '::' + JSON.stringify(options.messages.format);
  let promise = codecCacheByProjectRoot.get(cacheKey);
  if (!promise) {
    promise = resolveCodec(options.messages.format, projectRoot);
    codecCacheByProjectRoot.set(cacheKey, promise);
  }
  return promise;
}

export type PrecompileCatalogOptions = CatalogLoaderConfig & {
  /** Absolute path of the catalog file being compiled. */
  resourcePath: string;
  /** Project root used to resolve custom codec modules. */
  projectRoot: string;
};

/**
 * Bundler-agnostic catalog precompile. Mirrors the logic previously inlined
 * in next-intl's Webpack/Turbopack `catalogLoader`. Returns the JS module
 * source string that should be served in place of the raw catalog file.
 */
export async function precompileCatalog(
  source: string,
  options: PrecompileCatalogOptions
): Promise<string> {
  const codec = await getCodec(options, options.projectRoot);
  const extension = getFormatExtension(options.messages.format);
  const locale = path.basename(options.resourcePath, extension);
  let outputString: string;

  if (options.messages.precompile) {
    const decoded = codec.decode(source, {locale});
    const cache = getMessageCache(options.resourcePath);
    const precompiled = precompileMessages(decoded, cache);
    outputString = JSON.stringify(precompiled);
  } else {
    outputString = codec.toJSONString(source, {locale});
  }

  // https://v8.dev/blog/cost-of-javascript-2019#json
  return `export default JSON.parse(${JSON.stringify(outputString)});`;
}

/**
 * Recursively precompiles all ICU message strings in a messages array
 * using icu-minify/compile for smaller runtime bundles.
 */
function precompileMessages(
  messages: Array<ExtractorMessage>,
  cache: Map<string, CompiledMessageCacheEntry>
): Record<string, unknown> {
  const result = Object.create(null) as Record<string, unknown>;
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

  for (const cachedId of cacheKeysToEvict) {
    cache.delete(cachedId);
  }

  return result;
}
