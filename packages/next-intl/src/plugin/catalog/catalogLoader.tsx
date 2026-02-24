import fs from 'fs/promises';
import path from 'path';
import compile from 'icu-minify/compile';
import CatalogLocales from '../../extractor/catalog/CatalogLocales.js';
import CatalogPersister from '../../extractor/catalog/CatalogPersister.js';
import type ExtractorCodec from '../../extractor/format/ExtractorCodec.js';
import {
  getFormatExtension,
  resolveCodec
} from '../../extractor/format/index.js';
import type {
  CatalogLoaderConfig,
  ExtractorMessage,
  Locale
} from '../../extractor/types.js';
import {compareReferences, setNestedProperty} from '../../extractor/utils.js';
import Scanner from '../../scanner/Scanner.js';
import type {TurbopackLoaderContext} from '../types.js';

let cachedCodec: ExtractorCodec | null = null;
let scanner: Scanner | null = null;

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

function mergeMessagesByFile(
  messagesByFile: Map<string, Array<ExtractorMessage>>,
  projectRoot: string
): Map<string, ExtractorMessage> {
  const messagesById = new Map<string, ExtractorMessage>();
  for (const [filePath, messages] of messagesByFile) {
    const relativePath = path
      .relative(projectRoot, filePath)
      .split(path.sep)
      .join('/');
    for (let message of messages) {
      const prev = messagesById.get(message.id);
      if (prev) {
        message = {...message};
        if (message.references && prev.references) {
          const otherRefs = prev.references.filter(
            (ref) => ref.path !== relativePath
          );
          message.references = [...otherRefs, ...message.references].sort(
            compareReferences
          );
        }
        for (const key of Object.keys(prev)) {
          if (message[key] == null) message[key] = prev[key];
        }
      }
      messagesById.set(message.id, message);
    }
  }
  return messagesById;
}

async function runExtractionAndPersist(
  projectRoot: string,
  options: CatalogLoaderConfig
): Promise<void> {
  if (!scanner) {
    scanner = new Scanner({
      projectRoot,
      entry: (Array.isArray(options.srcPath)
        ? options.srcPath
        : [options.srcPath]) as Array<string>,
      tsconfigPath: path.join(projectRoot, 'tsconfig.json')
    });
  }
  const result = await scanner.scan();

  const messagesById = mergeMessagesByFile(result.messagesByFile, projectRoot);

  const codec = await getCodec(options, projectRoot);
  const extension = getFormatExtension(options.messages.format);
  const persister = new CatalogPersister({
    messagesPath: path.resolve(projectRoot, options.messages.path),
    codec,
    extension
  });

  const catalogLocales = new CatalogLocales({
    messagesDir: path.resolve(projectRoot, options.messages.path),
    sourceLocale: options.sourceLocale!,
    extension,
    locales: options.messages.locales
  });
  const targetLocales = await catalogLocales.getTargetLocales();

  const messages = Array.from(messagesById.values());

  await persister.read(options.sourceLocale!);
  await persister.write(messages, {
    locale: options.sourceLocale!,
    sourceMessagesById: messagesById
  });

  for (const locale of targetLocales) {
    const diskMessages = await persister.read(locale);
    const translationsByTarget = new Map<string, ExtractorMessage>();
    for (const m of diskMessages) {
      translationsByTarget.set(m.id, m);
    }
    const messagesToPersist = messages.map((msg) => {
      const localeMsg = translationsByTarget.get(msg.id);
      return {
        ...localeMsg,
        id: msg.id,
        description: msg.description,
        references: msg.references,
        message: localeMsg?.message ?? ''
      };
    });
    await persister.write(messagesToPersist, {
      locale: locale as Locale,
      sourceMessagesById: messagesById
    });
  }
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
  const locale = path.basename(this.resourcePath, extension);
  const projectRoot = this.rootContext;

  Promise.resolve()
    .then(async () => {
      let contentToDecode = source;

      const runExtraction =
        options.sourceLocale &&
        options.srcPath &&
        locale === options.sourceLocale;
      if (runExtraction) {
        const srcPaths = (
          Array.isArray(options.srcPath) ? options.srcPath : [options.srcPath]
        ) as Array<string>;
        for (const srcPath of srcPaths) {
          this.addContextDependency(path.resolve(projectRoot, srcPath));
        }
        const messagesDir = path.resolve(projectRoot, options.messages.path);
        this.addContextDependency(messagesDir);

        await runExtractionAndPersist(projectRoot, options);

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
