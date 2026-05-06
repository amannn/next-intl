import fs from 'fs/promises';
import path from 'path';
import type MessageExtractor from '../extractor/MessageExtractor.js';
import type ExtractorCodec from '../format/ExtractorCodec.js';
import {getFormatExtension, resolveCodec} from '../format/index.js';
import SourceFileScanner from '../source/SourceFileScanner.js';
import SourceFileWatcher, {
  type SourceFileWatcherEvent
} from '../source/SourceFileWatcher.js';
import type {
  ExtractorConfig,
  ExtractorMessage,
  Locale,
  SourceMessage
} from '../types.js';
import {
  compareReferences,
  getDefaultProjectRoot,
  localeCompare
} from '../utils.js';
import CatalogLocales from './CatalogLocales.js';
import CatalogPersister from './CatalogPersister.js';
import SaveScheduler from './SaveScheduler.js';

export default class CatalogManager implements Disposable {
  private config: ExtractorConfig;

  /**
   * Source of truth for extracted messages per file, including file-local
   * metadata like references and descriptions.
   */
  private messagesByFile: Map<
    /* File path */ string,
    Map</* ID */ string, ExtractorMessage>
  > = new Map();

  /**
   * Fast lookup for messages by ID, aggregated across all files.
   */
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
  private loadCatalogsPromise?: Promise<unknown>;

  // Resolves when the initial project scan and processing is complete
  private scanCompletePromise?: Promise<void>;

  public constructor(
    config: ExtractorConfig,
    opts: {
      projectRoot?: string;
      isDevelopment?: boolean;
      sourceMap?: boolean;
      extractor: MessageExtractor;
    }
  ) {
    this.config = config;
    this.saveScheduler = new SaveScheduler<void>(50);
    this.projectRoot = opts.projectRoot ?? getDefaultProjectRoot();
    this.isDevelopment = opts.isDevelopment ?? false;

    this.extractor = opts.extractor;

    if (this.isDevelopment) {
      // We kick this off as early as possible, so we get notified about changes
      // that happen during the initial project scan (while awaiting it to
      // complete though)
      this.sourceWatcher = new SourceFileWatcher(
        this.getSrcPaths(),
        this.handleFileEvents.bind(this)
      );
      void this.sourceWatcher.start();
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
        messagesPath: this.config.extract.path,
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
      const messagesDir = path.join(this.projectRoot, this.config.extract.path);
      this.catalogLocales = new CatalogLocales({
        messagesDir,
        extension: getFormatExtension(this.config.messages.format),
        locales: this.config.extract.locales,
        sourceLocale: this.config.extract.sourceLocale
      });
      return this.catalogLocales;
    }
  }

  private async getTargetLocales(): Promise<Array<Locale>> {
    return this.getCatalogLocales().getTargetLocales();
  }

  private getSrcPaths(): Array<string> {
    return (
      Array.isArray(this.config.extract.srcPath)
        ? this.config.extract.srcPath
        : [this.config.extract.srcPath]
    ).map((srcPath) => path.join(this.projectRoot, srcPath));
  }

  public async loadMessages() {
    const sourceDiskMessages = await this.loadSourceMessages();

    this.loadCatalogsPromise = this.loadTargetMessages();
    await this.loadCatalogsPromise;

    this.scanCompletePromise = (async () => {
      const sourceFiles = await SourceFileScanner.getSourceFiles(
        this.getSrcPaths()
      );
      await Promise.all(
        Array.from(sourceFiles).map(async (filePath) =>
          this.processFile(filePath)
        )
      );
      this.mergeSourceDiskMetadata(sourceDiskMessages);
    })();

    await this.scanCompletePromise;

    if (this.isDevelopment) {
      const catalogLocales = this.getCatalogLocales();
      catalogLocales.subscribeLocalesChange(this.onLocalesChange);
    }
  }

  private async loadSourceMessages(): Promise<Map<string, ExtractorMessage>> {
    // Load source catalog to hydrate metadata (e.g. flags) later without
    // treating catalog entries as source of truth.
    const diskMessages = await this.loadLocaleMessages(
      this.config.extract.sourceLocale
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

    if (locale === this.config.extract.sourceLocale) {
      // For source: Merge additional properties like flags
      for (const diskMessage of diskMessages) {
        const prev = this.messagesById.get(diskMessage.id);
        if (prev) {
          // Unknown properties (like flags): disk wins
          // Known properties: existing (from extraction) wins
          for (const key of Object.keys(diskMessage)) {
            if (!['id', 'message', 'description', 'references'].includes(key)) {
              // For unknown properties (like flags), disk wins
              prev[key] = diskMessage[key];
            }
          }
        } else {
          // The message no longer exists, so it will be removed
          // as part of the next save invocation.
        }
      }
    } else {
      // For target: disk wins completely, BUT preserve existing translations
      // if we read empty (likely a write in progress by an external tool
      // that causes the file to temporarily be empty)
      const existingTranslations = this.translationsByTargetLocale.get(locale);
      const hasExistingTranslations =
        existingTranslations && existingTranslations.size > 0;

      if (diskMessages.length > 0) {
        // We got content from disk, replace with it
        const translations = new Map<string, ExtractorMessage>();
        for (const message of diskMessages) {
          translations.set(message.id, message);
        }
        this.translationsByTargetLocale.set(locale, translations);
      } else if (hasExistingTranslations) {
        // Likely a write in progress, preserve existing translations
      } else {
        // We read empty and have no existing translations
        const translations = new Map<string, ExtractorMessage>();
        this.translationsByTargetLocale.set(locale, translations);
      }
    }
  }

  private mergeSourceDiskMetadata(
    diskMessages: Map<string, ExtractorMessage>
  ): void {
    for (const [id, diskMessage] of diskMessages) {
      const existing = this.messagesById.get(id);
      if (!existing) continue;

      for (const key of Object.keys(diskMessage)) {
        if (
          !['id', 'message', 'description', 'references'].includes(key) &&
          existing[key] == null
        ) {
          existing[key] = diskMessage[key];
        }
      }
    }
  }

  private async processFile(absoluteFilePath: string): Promise<boolean> {
    let messages: Array<SourceMessage> = [];
    try {
      const content = await fs.readFile(absoluteFilePath, 'utf8');
      let extraction: Awaited<ReturnType<typeof this.extractor.extract>>;
      try {
        extraction = await this.extractor.extract(absoluteFilePath, content);
      } catch {
        return false;
      }
      messages = extraction.messages;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw err;
      }
      // ENOENT -> treat as no messages
    }

    const prevFileMessages = this.messagesByFile.get(absoluteFilePath);
    const fileMessages = new Map<string, ExtractorMessage>();
    for (const message of messages) {
      const prevMessage = fileMessages.get(message.id);
      const extractorMessage = this.createExtractorMessage(message);
      if (prevMessage) {
        fileMessages.set(
          message.id,
          this.mergeMessagesFromSameFile(prevMessage, extractorMessage)
        );
      } else {
        fileMessages.set(message.id, extractorMessage);
      }
    }

    const affectedIds = new Set([
      ...Array.from(prevFileMessages?.keys() ?? []),
      ...Array.from(fileMessages.keys())
    ]);

    if (fileMessages.size > 0) {
      this.messagesByFile.set(absoluteFilePath, fileMessages);
    } else {
      this.messagesByFile.delete(absoluteFilePath);
    }

    for (const id of affectedIds) {
      this.rebuildMessageById(id);
    }

    const changed = this.haveMessagesChangedForFile(
      prevFileMessages,
      fileMessages
    );
    return changed;
  }

  private createExtractorMessage(message: SourceMessage): ExtractorMessage {
    return {
      id: message.id,
      message: message.message,
      ...(message.description != null && {
        description: message.description
      }),
      references: [message.reference]
    };
  }

  private mergeMessagesFromSameFile(
    existing: ExtractorMessage,
    message: ExtractorMessage
  ): ExtractorMessage {
    const merged: ExtractorMessage = {
      ...existing,
      ...message,
      references: [
        ...(existing.references ?? []),
        ...(message.references ?? [])
      ].sort(compareReferences)
    };
    const description = this.mergeDescriptions(
      existing.description,
      message.description
    );
    if (description != null) {
      merged.description = description;
    } else {
      delete merged.description;
    }
    return merged;
  }

  private rebuildMessageById(id: string): void {
    const fileMessages = Array.from(this.messagesByFile.values())
      .map((messages) => messages.get(id))
      .filter((message): message is ExtractorMessage => message != null);

    if (fileMessages.length === 0) {
      this.messagesById.delete(id);
      return;
    }

    const previousMessage = this.messagesById.get(id);
    const aggregate: ExtractorMessage = {
      ...fileMessages[0],
      references: fileMessages
        .flatMap((message) => message.references ?? [])
        .sort(compareReferences)
    };
    const description = this.mergeDescriptions(
      ...fileMessages.map((message) => message.description)
    );
    if (description != null) {
      aggregate.description = description;
    } else {
      delete aggregate.description;
    }

    if (previousMessage) {
      for (const key of Object.keys(previousMessage)) {
        if (
          !['id', 'message', 'description', 'references'].includes(key) &&
          aggregate[key] == null
        ) {
          aggregate[key] = previousMessage[key];
        }
      }
    }

    this.messagesById.set(id, aggregate);
  }

  private mergeDescriptions(
    ...descriptions: Array<ExtractorMessage['description'] | null>
  ): ExtractorMessage['description'] {
    const merged: Array<string> = [];
    for (const description of descriptions) {
      const values = this.getDescriptions(description);
      for (const value of values) {
        if (!merged.includes(value)) {
          merged.push(value);
        }
      }
    }

    merged.sort(localeCompare);
    if (merged.length === 0) return undefined;
    return merged.length === 1 ? merged[0] : merged;
  }

  private getDescriptions(
    description: ExtractorMessage['description'] | null
  ): Array<string> {
    if (typeof description === 'string') return [description];
    if (Array.isArray(description)) return description;
    return [];
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
      this.areDescriptionsEqual(msg1.description, msg2.description)
    );
  }

  private areDescriptionsEqual(
    descriptionA: ExtractorMessage['description'] | null,
    descriptionB: ExtractorMessage['description'] | null
  ): boolean {
    return (
      JSON.stringify(this.mergeDescriptions(descriptionA)) ===
      JSON.stringify(this.mergeDescriptions(descriptionB))
    );
  }

  public async save(): Promise<void> {
    return this.saveScheduler.schedule(() => this.saveImpl());
  }

  private async saveImpl(): Promise<void> {
    await this.saveLocale(this.config.extract.sourceLocale);
    const targetLocales = await this.getTargetLocales();
    await Promise.all(targetLocales.map((locale) => this.saveLocale(locale)));
  }

  private async saveLocale(locale: Locale): Promise<void> {
    await this.loadCatalogsPromise;

    const messages = Array.from(this.messagesById.values());
    const persister = await this.getPersister();
    const isSourceLocale = locale === this.config.extract.sourceLocale;

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

  private async handleFileEvents(events: Array<SourceFileWatcherEvent>) {
    if (this.loadCatalogsPromise) {
      await this.loadCatalogsPromise;
    }

    // Wait for initial scan to complete to avoid race conditions
    if (this.scanCompletePromise) {
      await this.scanCompletePromise;
    }

    let changed = false;
    const expandedEvents =
      await this.sourceWatcher!.expandDirectoryDeleteEvents(
        events,
        Array.from(this.messagesByFile.keys())
      );
    for (const event of expandedEvents) {
      const hasChanged = await this.processFile(event.path);
      changed ||= hasChanged;
    }

    if (changed) {
      await this.save();
    }
  }

  public [Symbol.dispose](): void {
    this.sourceWatcher?.stop();
    this.sourceWatcher = undefined;

    this.saveScheduler[Symbol.dispose]();
    if (this.catalogLocales && this.isDevelopment) {
      this.catalogLocales.unsubscribeLocalesChange(this.onLocalesChange);
    }
  }
}
