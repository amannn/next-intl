import fs from 'fs/promises';
import path from 'path';
import MessageExtractor from '../extractor/MessageExtractor.js';
import type Formatter from '../formatters/Formatter.js';
import formatters from '../formatters/index.js';
import SourceFileScanner from '../source/SourceFileScanner.js';
import type {ExtractedMessage, ExtractorConfig, Locale} from '../types.js';
import CatalogLocales from './CatalogLocales.js';
import CatalogPersister from './CatalogPersister.js';
import SaveScheduler from './SaveScheduler.js';

export default class CatalogManager {
  private config: ExtractorConfig;

  /* The source of truth for which messages are used. */
  private messagesByFile: Map<
    /* File path */ string,
    Map</* ID */ string, ExtractedMessage>
  > = new Map();

  /* Fast lookup for messages by ID across all files,
   * contains the same messages as `messagesByFile`. */
  private messagesById: Map<string, ExtractedMessage> = new Map();

  /**
   * This potentially also includes outdated ones that were initially available,
   * but are not used anymore. This allows to restore them if they are used again.
   **/
  private translationsByTargetLocale: Map<Locale, Map<string, string>> =
    new Map();

  private lastWriteByLocale: Map<Locale, Date | undefined> = new Map();

  private saveScheduler: SaveScheduler<number>;
  private projectRoot: string;
  private isDevelopment: boolean;

  // Cached instances
  private persister?: CatalogPersister;
  private formatter?: Formatter;
  private catalogLocales?: CatalogLocales;
  private messageExtractor: MessageExtractor;

  constructor(
    config: ExtractorConfig,
    opts: {projectRoot?: string; isDevelopment?: boolean} = {}
  ) {
    this.config = config;
    this.saveScheduler = new SaveScheduler<number>(50);
    this.projectRoot = opts.projectRoot || process.cwd();
    this.isDevelopment = opts.isDevelopment ?? false;

    this.messageExtractor = new MessageExtractor({
      isDevelopment: this.isDevelopment,
      projectRoot: this.projectRoot
    });
  }

  private async getFormatter(): Promise<Formatter> {
    if (this.formatter) {
      return this.formatter;
    } else {
      const FormatterClass = (await formatters[this.config.messages.format]())
        .default;
      this.formatter = new FormatterClass();
      return this.formatter;
    }
  }

  private async getPersister(): Promise<CatalogPersister> {
    if (this.persister) {
      return this.persister;
    } else {
      this.persister = new CatalogPersister(
        this.config.messages.path,
        await this.getFormatter()
      );
      return this.persister;
    }
  }

  private async getCatalogLocales(): Promise<CatalogLocales> {
    if (this.catalogLocales) {
      return this.catalogLocales;
    } else {
      const messagesDir = path.join(
        this.projectRoot,
        this.config.messages.path
      );
      const formatter = await this.getFormatter();
      this.catalogLocales = new CatalogLocales({
        messagesDir,
        sourceLocale: this.config.sourceLocale,
        extension: formatter.EXTENSION,
        locales: this.config.messages.locales
      });
      return this.catalogLocales;
    }
  }

  private async getTargetLocales(): Promise<Array<Locale>> {
    const catalogLocales = await this.getCatalogLocales();
    return catalogLocales.getTargetLocales();
  }

  getSrcPaths(): Array<string> {
    return (
      Array.isArray(this.config.srcPath)
        ? this.config.srcPath
        : [this.config.srcPath]
    ).map((srcPath) => path.join(this.projectRoot, srcPath));
  }

  getFileMessages(
    absoluteFilePath: string
  ): Map<string, ExtractedMessage> | undefined {
    return this.messagesByFile.get(absoluteFilePath);
  }

  public async loadMessages() {
    await this.loadSourceMessages();
    await this.loadTargetMessages();

    if (this.isDevelopment) {
      const catalogLocales = await this.getCatalogLocales();
      catalogLocales.subscribeLocalesChange(this.onLocalesChange);
    }
  }

  private async loadSourceMessages() {
    // First hydrate from source locale file to potentially init metadata
    await this.loadLocaleMessages(this.config.sourceLocale);

    // Then extract from all source files
    const sourceFiles = await SourceFileScanner.getSourceFiles(
      this.getSrcPaths()
    );

    await Promise.all(
      sourceFiles.map(async (filePath) =>
        this.extractFileMessages(filePath, await fs.readFile(filePath, 'utf8'))
      )
    );
  }

  private async loadLocaleMessages(
    locale: Locale
  ): Promise<Array<ExtractedMessage>> {
    const persister = await this.getPersister();
    try {
      const messages = await persister.read(locale);
      const fileTime = await persister.getLastModified(locale);
      this.lastWriteByLocale.set(locale, fileTime);
      return messages;
    } catch {
      return [];
    }
  }

  private async loadTargetMessages() {
    const targetLocales = await this.getTargetLocales();

    await Promise.all(
      targetLocales.map(async (locale) => {
        this.translationsByTargetLocale.set(locale, new Map());
        const messages = await this.loadLocaleMessages(locale);
        for (const message of messages) {
          const translations = this.translationsByTargetLocale.get(locale)!;
          translations.set(message.id, message.message);
        }
      })
    );
  }

  async extractFileMessages(
    absoluteFilePath: string,
    source: string
  ): Promise<{
    messages: Array<ExtractedMessage>;
    source: string;
    changed: boolean;
  }> {
    const result = await this.messageExtractor.processFileContent(
      absoluteFilePath,
      source
    );

    const prevFileMessages = this.messagesByFile.get(absoluteFilePath);

    // Init with all previous ones
    const idsToRemove = Array.from(prevFileMessages?.keys() ?? []);

    // Replace existing messages with new ones
    const fileMessages = new Map<string, ExtractedMessage>();

    for (let message of result.messages) {
      const prevMessage = this.messagesById.get(message.id);

      // Merge with previous message if it exists
      if (prevMessage) {
        // References: The `message` we receive here will always have one
        // reference, which is the current file. We need to merge this with
        // potentially existing references.
        const references = [...(prevMessage.references ?? [])];
        message.references.forEach((ref) => {
          if (!references.some((cur) => cur.path === ref.path)) {
            references.push(ref);
          }
        });
        message = {...message, references};

        // Description: In case we have conflicting descriptions, the new one wins.
        if (prevMessage.description && !message.description) {
          message = {
            ...message,
            description: prevMessage.description
          };
        }
      }

      this.messagesById.set(message.id, message);
      fileMessages.set(message.id, message);

      // This message continues to exist in this file
      const index = idsToRemove.indexOf(message.id);
      if (index !== -1) idsToRemove.splice(index, 1);
    }

    // Clean up removed messages at `messagesById`
    for (const id of idsToRemove) {
      this.messagesById.delete(id);
    }

    // Update the stored messages
    const hasMessages = result.messages.length > 0;

    if (hasMessages) {
      this.messagesByFile.set(absoluteFilePath, fileMessages);
    } else {
      this.messagesByFile.delete(absoluteFilePath);
    }

    const changed = this.haveMessagesChanged(prevFileMessages, fileMessages);
    return {...result, changed};
  }

  private haveMessagesChanged(
    beforeMessages: Map<string, ExtractedMessage> | undefined,
    afterMessages: Map<string, ExtractedMessage>
  ): boolean {
    // If one exists and the other doesn't, there's a change
    if (!beforeMessages) {
      return afterMessages.size > 0;
    }

    // Different sizes means changes
    if (beforeMessages.size !== afterMessages.size) {
      return true;
    }

    // Check differences in beforeMessages vs afterMessages
    for (const [id, msg1] of beforeMessages) {
      const msg2 = afterMessages.get(id);
      if (!msg2 || !this.areMessagesEqual(msg1, msg2)) {
        return true; // Early exit on first difference
      }
    }

    return false;
  }

  private areMessagesEqual(
    msg1: ExtractedMessage,
    msg2: ExtractedMessage
  ): boolean {
    return (
      msg1.id === msg2.id &&
      msg1.message === msg2.message &&
      msg1.description === msg2.description &&
      this.areReferencesEqual(msg1.references, msg2.references)
    );
  }

  private areReferencesEqual(
    refs1: Array<{path: string}> | undefined,
    refs2: Array<{path: string}> | undefined
  ): boolean {
    // Both undefined or both empty
    if (!refs1 && !refs2) return true;
    if (!refs1 || !refs2) return false;
    if (refs1.length !== refs2.length) return false;

    // Compare each reference
    for (let i = 0; i < refs1.length; i++) {
      if (refs1[i].path !== refs2[i].path) {
        return false;
      }
    }

    return true;
  }

  async save(): Promise<number> {
    return this.saveScheduler.schedule(() => this.saveImpl());
  }

  private async saveImpl(): Promise<number> {
    const messages = Array.from(this.messagesById.values());

    const persister = await this.getPersister();
    await persister.write(this.config.sourceLocale, messages);

    for (const locale of await this.getTargetLocales()) {
      await this.saveLocale(locale);
    }

    return messages.length;
  }

  private async saveLocale(locale: Locale): Promise<void> {
    const messages = Array.from(this.messagesById.values());
    const persister = await this.getPersister();

    // Check if file was modified externally
    const lastWriteTime = this.lastWriteByLocale.get(locale);
    const currentFileTime = await persister.getLastModified(locale);

    // If file was modified externally, read and merge
    if (currentFileTime && lastWriteTime && currentFileTime > lastWriteTime) {
      const diskMessages = await persister.read(locale);
      const translations = this.translationsByTargetLocale.get(locale)!;

      for (const diskMessage of diskMessages) {
        // Disk wins: preserve manual edits
        translations.set(diskMessage.id, diskMessage.message);
      }
    }

    const translations = this.translationsByTargetLocale.get(locale)!;
    const localeMessages = messages.map((message) => ({
      ...message,
      message: translations.get(message.id) || ''
    }));

    await persister.write(locale, localeMessages);

    // Update timestamps
    const newTime = await persister.getLastModified(locale);
    this.lastWriteByLocale.set(locale, newTime);
  }

  private onLocalesChange = async (params: {
    added: Array<Locale>;
    removed: Array<Locale>;
  }): Promise<void> => {
    for (const locale of params.added) {
      const translations = new Map();
      this.translationsByTargetLocale.set(locale, translations);
      const messages = await this.loadLocaleMessages(locale);
      for (const message of messages) {
        translations.set(message.id, message.message);
      }
      await this.saveLocale(locale);
    }

    for (const locale of params.removed) {
      this.translationsByTargetLocale.delete(locale);
      this.lastWriteByLocale.delete(locale);
    }
  };

  destroy(): void {
    this.saveScheduler.destroy();
    if (this.catalogLocales && this.isDevelopment) {
      this.catalogLocales.unsubscribeLocalesChange(this.onLocalesChange);
    }
  }
}
