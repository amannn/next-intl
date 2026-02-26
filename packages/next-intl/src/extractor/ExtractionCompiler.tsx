import path from 'path';
import {getInstrumentation} from '../instrumentation/index.js';
import EntryScanner, {type EntryScanResult} from '../scanner/EntryScanner.js';
import CatalogLocales from './catalog/CatalogLocales.js';
import CatalogPersister from './catalog/CatalogPersister.js';
import type ExtractorCodec from './format/ExtractorCodec.js';
import {getFormatExtension} from './format/index.js';
import type {ExtractorMessage, Locale, MessagesConfig} from './types.js';

export type ExtractionCompilerConfig = {
  codec: ExtractorCodec;
  isDevelopment: boolean;
  messages: MessagesConfig;
  projectRoot: string;
  sourceLocale: string;
  srcPaths: Array<string>;
  tsconfigPath: string;
};

export default class ExtractionCompiler {
  private config: ExtractionCompilerConfig;
  private scanner: EntryScanner;
  private translationsCache: Record<string, Record<string, string>> = {};

  public constructor(config: ExtractionCompilerConfig) {
    this.config = config;
    this.scanner = new EntryScanner({
      entry: config.srcPaths,
      isDevelopment: config.isDevelopment,
      projectRoot: config.projectRoot,
      tsconfigPath: config.tsconfigPath
    });
  }

  public async extract(): Promise<string> {
    const I = getInstrumentation();
    I.start('[ExtractionCompiler.extract]');

    const result = await this.scanner.scan();
    const messagesById = this.getMessagesById(result);

    const extension = getFormatExtension(this.config.messages.format);
    const messagesPath = path.resolve(
      this.config.projectRoot,
      this.config.messages.path
    );
    const persister = new CatalogPersister({
      codec: this.config.codec,
      extension,
      messagesPath
    });

    const catalogLocales = new CatalogLocales({
      extension,
      locales: this.config.messages.locales,
      messagesDir: messagesPath,
      sourceLocale: this.config.sourceLocale
    });
    const targetLocales = await catalogLocales.getTargetLocales();

    const messages = Array.from(messagesById.values());

    const sourceDiskMessages = await persister.read(this.config.sourceLocale);
    const sourceByDisk = new Map<string, ExtractorMessage>();
    for (const cur of sourceDiskMessages) {
      sourceByDisk.set(cur.id, cur);
    }
    const sourceMessagesToPersist = messages.map((msg) => {
      const diskMsg = sourceByDisk.get(msg.id);
      return {
        ...diskMsg,
        description: msg.description,
        id: msg.id,
        message: msg.message,
        references: msg.references
      };
    });
    const sourceContent = await persister.write(sourceMessagesToPersist, {
      locale: this.config.sourceLocale,
      sourceMessagesById: messagesById
    });

    for (const locale of targetLocales) {
      this.translationsCache[locale] ??= {};
      const diskMessages = await persister.read(locale);
      const translationsByTarget = new Map<string, ExtractorMessage>();
      for (const cur of diskMessages) {
        translationsByTarget.set(cur.id, cur);
        if (!messagesById.has(cur.id) && cur.message) {
          this.translationsCache[locale][cur.id] = cur.message;
        }
      }
      const localeOrphans = this.translationsCache[locale];
      const messagesToPersist = messages.map((msg) => {
        const localeMsg = translationsByTarget.get(msg.id);
        const orphaned = localeOrphans[msg.id];
        const message = (localeMsg?.message ?? orphaned) || '';
        if (orphaned) delete this.translationsCache[locale]![msg.id];
        return {
          ...localeMsg,
          description: msg.description,
          id: msg.id,
          message,
          references: msg.references
        };
      });
      await persister.write(messagesToPersist, {
        locale: locale as Locale,
        sourceMessagesById: messagesById
      });
    }

    I.end('[ExtractionCompiler.extract]', {
      filesScanned: result.size,
      messagesExtracted: messagesById.size,
      targetLocales: targetLocales.length
    });
    return sourceContent;
  }

  private getMessagesById(
    result: EntryScanResult
  ): Map<string, ExtractorMessage> {
    const messagesById = new Map<string, ExtractorMessage>();
    for (const entry of result.values()) {
      for (const m of entry.messages) {
        if (m.type !== 'Extracted') continue;
        const prev = messagesById.get(m.id);
        const message: ExtractorMessage = {
          id: m.id,
          message: m.message ?? prev?.message ?? '',
          description: m.description ?? prev?.description,
          references: m.references
        };
        if (prev) {
          for (const key of Object.keys(prev)) {
            if (message[key] == null) message[key] = prev[key];
          }
        }
        messagesById.set(m.id, message);
      }
    }
    return messagesById;
  }
}
