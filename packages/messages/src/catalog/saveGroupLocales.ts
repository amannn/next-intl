import fs from 'fs/promises';
import path from 'path';
import type {ExtractorMessage, Locale} from '../types.js';
import {stripNamespacePrefix} from './namespacePrefix.js';
import saveCatalog from './saveCatalog.js';
import type {CatalogGroup, MessagesCodec, SeparateFileCodec} from './types.js';

/**
 * The single write funnel both layouts go through. A shared-file group
 * encodes every changed locale into its one file with the instance that
 * decoded it, so unchanged locales and unknown fields survive.
 */
export default async function saveGroupLocales(options: {
  group: CatalogGroup;
  /** Full message lists, only of the locales that changed. */
  updates: Array<{locale: Locale; messages: Array<ExtractorMessage>}>;
  sourceLocale: Locale;
  /** For codecs whose encode references the source catalog. */
  sourceMessagesById?: Map<string, ExtractorMessage>;
  /** For a separate file no catalog was decoded from. */
  codecFactory(): MessagesCodec;
}): Promise<void> {
  const {
    group,
    updates,
    sourceLocale,
    sourceMessagesById = new Map(),
    codecFactory
  } = options;
  if (updates.length === 0) return;

  if (group.shared) {
    const messagesByLocale = Object.fromEntries(
      updates.map(({locale, messages}) => [
        locale,
        stripNamespacePrefix(messages, group.namespace)
      ])
    );
    const content = group.shared.codec.encodeAll(messagesByLocale, {
      sourceLocale
    });
    await fs.mkdir(path.dirname(group.shared.file), {recursive: true});
    await fs.writeFile(group.shared.file, content, 'utf8');
    return;
  }

  await Promise.all(
    updates.map(({locale, messages}) => {
      const catalog = group.byLocale.get(locale);
      return saveCatalog({
        file: catalog?.file ?? group.resolveFile(locale),
        locale,
        messages,
        // A file no catalog was decoded from is new, so a fresh instance is
        // right. The load validated the layout, so the factory produces
        // per-locale codecs whenever the group isn't shared.
        codec: catalog?.codec ?? (codecFactory() as SeparateFileCodec),
        sourceMessagesById,
        namespace: group.namespace
      });
    })
  );
}
