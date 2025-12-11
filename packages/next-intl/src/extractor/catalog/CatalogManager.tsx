import fs from 'fs/promises';
import path from 'path';
import type MessageExtractor from '../extractor/MessageExtractor.js';
import type ExtractorCodec from '../format/ExtractorCodec.js';
import {getFormatExtension, resolveCodec} from '../format/index.js';
import SourceFileScanner from '../source/SourceFileScanner.js';
import SourceFileWatcher from '../source/SourceFileWatcher.js';
import type {ExtractorConfig, ExtractorMessage, Locale} from '../types.js';
import {localeCompare} from '../utils.js';
import CatalogLocales from './CatalogLocales.js';
import CatalogPersister from './CatalogPersister.js';
import SaveScheduler from './SaveScheduler.js';

export default class CatalogManager {
  private config: ExtractorConfig;

  /* The source of truth for which messages are used. */
  private messagesByFile: Map<
    /* File path */ string,
    Map</* ID */ string, ExtractorMessage>
  > = new Map();

  /* Fast lookup for messages by ID across all files,
   * contains the same messages as `messagesByFile`. */
  private messagesById: Map<string, ExtractorMessage> = new Map();

  /**
   * This potentially also includes outdated ones that were initially available,
   * but are not used anymore. This allows to restore them if they are used again.
   **/
  private translationsByTargetLocale: Map<
    Locale,
    Map</* ID */ string, ExtractorMessage>
  > = new Map();

  private lastWriteByLocale: Map<Locale, Date | undefined> = new Map();

  private saveScheduler: SaveScheduler<void>;
  private projectRoot: string;
  private isDevelopment: boolean;

  // Cached instances
  private persister?: CatalogPersister;
  private codec?: ExtractorCodec;
  private catalogLocales?: CatalogLocales;
  private extractor: MessageExtractor;
  private sourceWatcher?: SourceFileWatcher;

  // Resolves when all catalogs are loaded
  // (but doesn't indicate that project scan is done)
  loadCatalogsPromise?: Promise<unknown>;

  constructor(
    config: ExtractorConfig,
    opts: {
      projectRoot?: string;
      isDevelopment?: boolean;
      sourceMap?: boolean;
      messageExtractor: MessageExtractor;
    }
  ) {
    this.config = config;
    this.saveScheduler = new SaveScheduler<void>(50);
    this.projectRoot = opts.projectRoot || process.cwd();
    this.isDevelopment = opts.isDevelopment ?? false;

    this.extractor = opts.messageExtractor;

    if (this.isDevelopment) {
      void this.startSourceWatcher();
    }
  }

  private async getCodec(): Promise<ExtractorCodec> {
    if (!this.codec) {
      this.codec = await resolveCodec(
        this.config.messages.format,
        this.projectRoot
      );
    }
    return this.codec;
  }

  private async getPersister(): Promise<CatalogPersister> {
    if (this.persister) {
      return this.persister;
    } else {
      this.persister = new CatalogPersister({
        messagesPath: this.config.messages.path,
        codec: await this.getCodec(),
        extension: getFormatExtension(this.config.messages.format)
      });
      return this.persister;
    }
  }

  private getCatalogLocales(): CatalogLocales {
    if (this.catalogLocales) {
      return this.catalogLocales;
    } else {
      const messagesDir = path.join(
        this.projectRoot,
        this.config.messages.path
      );
      this.catalogLocales = new CatalogLocales({
        messagesDir,
        sourceLocale: this.config.sourceLocale,
        extension: getFormatExtension(this.config.messages.format),
        locales: this.config.messages.locales
      });
      return this.catalogLocales;
    }
  }

  private async getTargetLocales(): Promise<Array<Locale>> {
    return this.getCatalogLocales().getTargetLocales();
  }

  getSrcPaths(): Array<string> {
    return (
      Array.isArray(this.config.srcPath)
        ? this.config.srcPath
        : [this.config.srcPath]
    ).map((srcPath) => path.join(this.projectRoot, srcPath));
  }

  public async loadMessages() {
    const sourceDiskMessages = await this.loadSourceMessages();
    this.loadCatalogsPromise = this.loadTargetMessages();
    await this.loadCatalogsPromise;

    const sourceFiles = await SourceFileScanner.getSourceFiles(
      this.getSrcPaths()
    );
    await Promise.all(
      Array.from(sourceFiles).map(async (filePath) =>
        this.processFile(filePath)
      )
    );

    this.mergeSourceDiskMetadata(sourceDiskMessages);

    if (this.isDevelopment) {
      const catalogLocales = this.getCatalogLocales();
      catalogLocales.subscribeLocalesChange(this.onLocalesChange);
    }
  }

  private async loadSourceMessages(): Promise<Map<string, ExtractorMessage>> {
    // Load source catalog to hydrate metadata (e.g. flags) later without
    // treating catalog entries as source of truth.
    const diskMessages = await this.loadLocaleMessages(
      this.config.sourceLocale
    );
    const byId = new Map<string, ExtractorMessage>();
    for (const diskMessage of diskMessages) {
      byId.set(diskMessage.id, diskMessage);
    }
    return byId;
  }

  private async loadLocaleMessages(
    locale: Locale
  ): Promise<Array<ExtractorMessage>> {
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
          const merged = {
            ...diskMessage,
            id: prev.id,
            message: prev.message,
            description: prev.description,
            references: prev.references
          };
          this.messagesById.set(diskMessage.id, merged);

          // Keep per-file messages in sync with updated metadata
          for (const [filePath, messages] of this.messagesByFile) {
            if (messages.has(diskMessage.id)) {
              messages.set(diskMessage.id, merged);
              this.messagesByFile.set(filePath, messages);
            }
          }
        } else {
          // The message no longer exists, so it will be removed
          // as part of the next save invocation.
        }
      }
    } else {
      // For target: disk wins completely
      const translations = new Map<string, ExtractorMessage>();
      for (const message of diskMessages) {
        translations.set(message.id, message);
      }
      this.translationsByTargetLocale.set(locale, translations);
    }
  }

  private mergeSourceDiskMetadata(
    diskMessages: Map<string, ExtractorMessage>
  ): void {
    for (const [id, diskMessage] of diskMessages) {
      const existing = this.messagesById.get(id);
      if (!existing) continue;

      const merged = {...existing};
      for (const key of Object.keys(diskMessage)) {
        if (merged[key] == null) {
          merged[key] = diskMessage[key];
        }
      }
      this.messagesById.set(id, merged);
    }
  }

  public async processFile(absoluteFilePath: string): Promise<boolean> {
    let messages: Array<ExtractorMessage> = [];
    try {
      const content = await fs.readFile(absoluteFilePath, 'utf8');
      const extraction = await this.extractor.extract(
        absoluteFilePath,
        content
      );
      messages = extraction.messages;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw err;
      }
      // ENOENT -> treat as no messages
    }

    const prevFileMessages = this.messagesByFile.get(absoluteFilePath);

    // Init with all previous ones
    const idsToRemove = Array.from(prevFileMessages?.keys() ?? []);

    // Replace existing messages with new ones
    const fileMessages = new Map<string, ExtractorMessage>();

    for (let message of messages) {
      const prevMessage = this.messagesById.get(message.id);

      // Merge with previous message if it exists
      if (prevMessage) {
        const validated = await this.validateExistingReferences(
          message.id,
          prevMessage.references ?? [],
          absoluteFilePath
        );
        message = {
          ...message,
          references: this.mergeReferences(validated, {
            path: path.relative(this.projectRoot, absoluteFilePath)
          })
        };

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
    if (messages.length > 0) {
      this.messagesByFile.set(absoluteFilePath, fileMessages);
    } else {
      this.messagesByFile.delete(absoluteFilePath);
    }

    const changed = this.haveMessagesChangedForFile(
      prevFileMessages,
      fileMessages
    );
    return changed;
  }

  private async validateExistingReferences(
    messageId: string,
    references: Array<{path: string}>,
    currentAbsoluteFilePath: string
  ): Promise<Array<{path: string}>> {
    const validated: Array<{path: string}> = [];

    for (const ref of references) {
      const refAbsoluteFilePath = path.join(this.projectRoot, ref.path);

      // No need to validate references to the same file
      if (refAbsoluteFilePath === currentAbsoluteFilePath) continue;

      const refSource = await fs
        .readFile(refAbsoluteFilePath, 'utf8')
        .catch((err) => {
          if (err && err.code === 'ENOENT') {
            return null;
          }
          throw err;
        });

      if (!refSource) continue;

      const refResult = await this.extractor.extract(
        refAbsoluteFilePath,
        refSource
      );
      if (refResult.messages.some((msg) => msg.id === messageId)) {
        validated.push(ref);
      }
    }

    return validated;
  }

  private mergeReferences(
    existing: Array<{path: string}>,
    current: {path: string}
  ): Array<{path: string}> {
    const dedup = new Map<string, {path: string}>();
    for (const ref of existing) {
      dedup.set(ref.path, ref);
    }
    dedup.set(current.path, current);
    return Array.from(dedup.values()).sort((a, b) =>
      localeCompare(a.path, b.path)
    );
  }

  private haveMessagesChangedForFile(
    beforeMessages: Map<string, ExtractorMessage> | undefined,
    afterMessages: Map<string, ExtractorMessage>
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
    msg1: ExtractorMessage,
    msg2: ExtractorMessage
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

    const localeMessages = isSourceLocale
      ? this.messagesById
      : this.translationsByTargetLocale.get(locale);

    const messagesToPersist = messages.map((message) => {
      const localeMessage = localeMessages?.get(message.id);
      return {
        ...localeMessage,
        id: message.id,
        description: message.description,
        references: message.references,
        message: isSourceLocale
          ? message.message
          : (localeMessage?.message ?? '')
      };
    });

    await persister.write(messagesToPersist, {
      locale,
      sourceMessagesById: this.messagesById
    });

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

  private async startSourceWatcher(): Promise<void> {
    if (!this.isDevelopment || this.sourceWatcher) return;
    this.sourceWatcher = new SourceFileWatcher(this.getSrcPaths(), (events) =>
      this.handleFileEvents(events)
    );
    await this.sourceWatcher.start();

    const stop = () => void this.stopSourceWatcher();
    process.once('exit', stop);
    process.once('SIGINT', stop);
    process.once('SIGTERM', stop);
  }

  private async stopSourceWatcher(): Promise<void> {
    await this.sourceWatcher?.stop();
    this.sourceWatcher = undefined;
  }

  private async handleFileEvents(events: Array<{type: string; path: string}>) {
    if (this.loadCatalogsPromise) {
      await this.loadCatalogsPromise;
    }

    let changed = false;

    for (const event of events) {
      const hasChanged = await this.processFile(event.path);
      changed ||= hasChanged;
    }

    if (changed) {
      await this.save();
    }
  }

  destroy(): void {
    void this.stopSourceWatcher();
    this.saveScheduler.destroy();
    if (this.catalogLocales && this.isDevelopment) {
      this.catalogLocales.unsubscribeLocalesChange(this.onLocalesChange);
    }
  }
}
