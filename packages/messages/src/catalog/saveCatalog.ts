import fs from 'fs/promises';
import path from 'path';
import type {ExtractorMessage, Locale} from '../types.js';
import {stripNamespacePrefix} from './namespacePrefix.js';
import type {SeparateFileCodec} from './types.js';

export default async function saveCatalog(options: {
  file: string;
  locale: Locale;
  /** The full message list of the locale. */
  messages: Array<ExtractorMessage>;
  /** The instance the catalog was loaded with, so decode state reaches encode. */
  codec: SeparateFileCodec;
  /** For codecs whose encode references the source catalog. */
  sourceMessagesById?: Map<string, ExtractorMessage>;
  /** Stripped from each id as `${namespace}.`, so the file holds relative keys. */
  namespace?: string;
}): Promise<void> {
  const {
    file,
    locale,
    messages,
    codec,
    sourceMessagesById = new Map(),
    namespace
  } = options;

  const sourceById =
    namespace === undefined
      ? sourceMessagesById
      : new Map(
          stripNamespacePrefix([...sourceMessagesById.values()], namespace).map(
            (message) => [message.id, message]
          )
        );
  const content = codec.encode(stripNamespacePrefix(messages, namespace), {
    locale,
    sourceMessagesById: sourceById
  });
  // Templated paths route a new locale into a folder that may not exist yet
  await fs.mkdir(path.dirname(file), {recursive: true});
  await fs.writeFile(file, content, 'utf8');
}
