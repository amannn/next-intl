import fs from 'fs/promises';
import path from 'path';
import MessageExtractor from '../extractor/MessageExtractor.js';
import type Formatter from '../formatters/Formatter.js';
import formatters from '../formatters/index.js';
import SourceFileScanner from '../source/SourceFileScanner.js';
import type {ExtractedMessage, ExtractorConfig, Locale} from '../types.js';
import {localeCompare} from '../utils.js';
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
  private translationsByTargetLocale: Map<
    Locale,
    Map</* ID */ string, ExtractedMessage>
  > = new Map();

  private lastWriteByLocale: Map<Locale, Date | undefined> = new Map();

  private saveScheduler: SaveScheduler<void>;
  private projectRoot: string;
  private isDevelopment: boolean;

  // Cached instances
  private persister?: CatalogPersister;
  private formatter?: Formatter;
  private catalogLocales?: CatalogLocales;
  private messageExtractor: MessageExtractor;

  // Resolves when all catalogs are loaded
  // (but doesn't indicate that project scan is done)
  loadCatalogsPromise?: Promise<unknown>;

  constructor(
    config: ExtractorConfig,
    opts: {
      projectRoot?: string;
      isDevelopment?: boolean;
      sourceMap?: boolean;
    } = {}
  ) {
    this.config = config;
    this.saveScheduler = new SaveScheduler<void>(50);
    this.projectRoot = opts.projectRoot || process.cwd();
    this.isDevelopment = opts.isDevelopment ?? false;

    this.messageExtractor = new MessageExtractor({
      isDevelopment: this.isDevelopment,
      projectRoot: this.projectRoot,
      sourceMap: opts.sourceMap
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

  public async loadMessages() {
    this.loadCatalogsPromise = Promise.all([
      this.loadSourceMessages(),
      this.loadTargetMessages()
    ]);

    // Ensure catalogs are loaded before scanning source files.
    // Otherwise, `loadSourceMessages` might overwrite extracted
    // messages if it finishes after source file extraction.
    await this.loadCatalogsPromise;

    if (this.isDevelopment) {
      const catalogLocales = await this.getCatalogLocales();
      catalogLocales.subscribeLocalesChange(this.onLocalesChange);
    }

    const sourceFiles = await SourceFileScanner.getSourceFiles(
      this.getSrcPaths()
    );
    await Promise.all(
      sourceFiles.map(async (filePath) =>
        this.extractFileMessages(filePath, await fs.readFile(filePath, 'utf8'))
      )
    );
  }

  private async loadSourceMessages() {
    // First hydrate from source locale file to potentially init metadata
    const messages = await this.loadLocaleMessages(this.config.sourceLocale);
    const messagesById: typeof this.messagesById = new Map();
    const messagesByFile: typeof this.messagesByFile = new Map();
    for (const message of messages) {
      messagesById.set(message.id, message);
      if (message.references) {
        for (const ref of message.references) {
          const absoluteFilePath = path.join(this.projectRoot, ref.path);
          let fileMessages = messagesByFile.get(absoluteFilePath);
          if (!fileMessages) {
            fileMessages = new Map();
            messagesByFile.set(absoluteFilePath, fileMessages);
          }
          fileMessages.set(message.id, message);
        }
      }
    }
    this.messagesById = messagesById;
    this.messagesByFile = messagesByFile;
  }

  private async loadLocaleMessages(
    locale: Locale
  ): Promise<Array<ExtractedMessage>> {
    const persister = await this.getPersister();
    const messages = await persister.read(locale);
    const fileTime = await persister.getLastModified(locale);
    this.lastWriteByLocale.set(locale, fileTime);
    return messages;
  }

  private async loadTargetMessages() {
    const targetLocales = await this.getTargetLocales();
    await Promise.all(
      targetLocales.map((locale) => this.reloadLocaleCatalog(locale))
    );
  }

  private async reloadLocaleCatalog(locale: Locale): Promise<void> {
    const diskMessages = await this.loadLocaleMessages(locale);

    if (locale === this.config.sourceLocale) {
      // For source: Merge additional properties like flags
      for (const diskMessage of diskMessages) {
        const prev = this.messagesById.get(diskMessage.id);
        if (prev) {
          // Unknown properties (like flags): disk wins
          // Known properties: existing (from extraction) wins
          this.messagesById.set(diskMessage.id, {
            ...diskMessage,
            id: prev.id,
            message: prev.message,
            description: prev.description,
            references: prev.references
          });
        } else {
          // The message no longer exists, so it will be removed
          // as part of the next save invocation.
        }
      }
    } else {
      // For target: disk wins completely
      const translations = new Map<string, ExtractedMessage>();
      for (const message of diskMessages) {
        translations.set(message.id, message);
      }
      this.translationsByTargetLocale.set(locale, translations);
    }
  }

  async extractFileMessages(
    absoluteFilePath: string,
    source: string
  ): Promise<{
    messages: Array<ExtractedMessage>;
    code: string;
    changed: boolean;
    map?: string;
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
        references.sort((referenceA, referenceB) =>
          localeCompare(referenceA.path, referenceB.path)
        );
        message = {...message, references};

        // Merge other properties like description, or unknown
        // attributes like flags that are opaque to us
        for (const key of Object.keys(prevMessage)) {
          if (message[key] == null) {
            message[key] = prevMessage[key];
          }
        }
      }

      this.messagesById.set(message.id, message);
      fileMessages.set(message.id, message);

      // This message continues to exist in this file
      const index = idsToRemove.indexOf(message.id);
      if (index !== -1) idsToRemove.splice(index, 1);
    }

    // Don't delete IDs still used in other files
    const relativeFilePath = path.relative(this.projectRoot, absoluteFilePath);
    const idsToDelete = idsToRemove.filter((id) => {
      const message = this.messagesById.get(id);
      return !message?.references?.some((ref) => ref.path !== relativeFilePath);
    });

    // Clean up removed messages from `messagesById`
    idsToDelete.forEach((id) => {
      this.messagesById.delete(id);
    });

    // Update the stored messages
    const hasMessages = result.messages.length > 0;

    if (hasMessages) {
      this.messagesByFile.set(absoluteFilePath, fileMessages);
    } else {
      this.messagesByFile.delete(absoluteFilePath);
    }

    const changed = this.haveMessagesChangedForFile(
      prevFileMessages,
      fileMessages
    );
    return {...result, changed};
  }

  private haveMessagesChangedForFile(
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
    // Note: We intentionally don't compare references here.
    // References are aggregated metadata from multiple files and comparing
    // them would cause false positives due to parallel extraction order.
    return (
      msg1.id === msg2.id &&
      msg1.message === msg2.message &&
      msg1.description === msg2.description
    );
  }

  async save(): Promise<void> {
    return this.saveScheduler.schedule(() => this.saveImpl());
  }

  private async saveImpl(): Promise<void> {
    await this.saveLocale(this.config.sourceLocale);
    const targetLocales = await this.getTargetLocales();
    await Promise.all(targetLocales.map((locale) => this.saveLocale(locale)));
  }

  private async saveLocale(locale: Locale): Promise<void> {
    await this.loadCatalogsPromise;

    const messages = Array.from(this.messagesById.values());
    const persister = await this.getPersister();
    const isSourceLocale = locale === this.config.sourceLocale;

    // Check if file was modified externally (poll-at-save is cheaper than
    // watchers here since stat() is fast and avoids continuous overhead)
    const lastWriteTime = this.lastWriteByLocale.get(locale);
    const currentFileTime = await persister.getLastModified(locale);
    if (currentFileTime && lastWriteTime && currentFileTime > lastWriteTime) {
      await this.reloadLocaleCatalog(locale);
    }

    const prevMessages = isSourceLocale
      ? this.messagesById
      : this.translationsByTargetLocale.get(locale);

    const localeMessages = messages.map((message) => {
      const prev = prevMessages?.get(message.id);
      return {
        ...prev,
        id: message.id,
        description: message.description,
        references: message.references,
        message: isSourceLocale ? message.message : (prev?.message ?? '')
      };
    });

    await persister.write(locale, localeMessages);

    // Update timestamps
    const newTime = await persister.getLastModified(locale);
    this.lastWriteByLocale.set(locale, newTime);
  }

  private onLocalesChange = async (params: {
    added: Array<Locale>;
    removed: Array<Locale>;
  }): Promise<void> => {
    // Chain to existing promise
    this.loadCatalogsPromise = Promise.all([
      this.loadCatalogsPromise,
      ...params.added.map((locale) => this.reloadLocaleCatalog(locale))
    ]);

    for (const locale of params.added) {
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
