import fs from 'fs/promises';
import path from 'path';
import {
  type ExtractorConfig,
  type MessageExtractor,
  type SourceExtractedMessage,
  SourceFileScanner,
  aggregateMessage,
  fillUnownedFields,
  getLocaleMessages,
  getSrcPaths,
  groupSourceMessagesById,
  isExtractorOwnedKey
} from '@eloqnt/extractor/_internal';
import {
  CatalogPersister,
  type ExtractorCodec,
  type ExtractorMessage,
  type Locale,
  getFormatExtension,
  resolveCodec
} from '@eloqnt/messages/_internal';
import CatalogLocales from './CatalogLocales.js';
import SaveScheduler from './SaveScheduler.js';
import {
  type SourceFileEvent,
  expandDirectoryDeleteEvents,
  normalizeEvents
} from './SourceFileEvents.js';

/**
 * Keeps the messages files up to date while `next dev` runs: re-extracts the
 * files that change and picks up messages files that are added or edited.
 */
export default class CatalogManager implements Disposable {
  private config: ExtractorConfig;

  /**
   * Source of truth for statically extracted source messages,
   * grouped by file and message ID.
   */
  private sourceMessagesByFile: Map<
    /* File path */ string,
    Map</* ID */ string, Array<SourceExtractedMessage>>
  > = new Map();

  /**
   * Reverse index for rebuilding aggregated messages without scanning all files.
   * Contains the same `SourceExtractedMessage` arrays as `sourceMessagesByFile` and is
   * kept in sync with it.
   */
  private sourceMessagesById: Map<
    /* ID */ string,
    Map</* File path */ string, Array<SourceExtractedMessage>>
  > = new Map();

  /**
   * Fast lookup for messages by ID, aggregated across all files. This combines
   * metadata from `sourceMessagesById`, e.g. references and descriptions.
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
  private warn?: (message: string) => void;

  // Cached instances
  private persister?: CatalogPersister;
  private codec?: ExtractorCodec;
  private catalogLocales?: CatalogLocales;
  private extractor: MessageExtractor;

  // Resolves when all catalogs are loaded
  private loadCatalogsPromise?: Promise<unknown>;

  // Resolves when the initial project scan and processing is complete
  private scanCompletePromise?: Promise<void>;

  public constructor(
    config: ExtractorConfig,
    opts: {
      extractor: MessageExtractor;
      projectRoot: string;
      saveDebounceMs?: number;
      warn?(message: string): void;
    }
  ) {
    this.config = config;
    this.saveScheduler = new SaveScheduler<void>(opts.saveDebounceMs ?? 50);
    this.projectRoot = opts.projectRoot;
    this.warn = opts.warn;

    this.extractor = opts.extractor;
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
        extension: getFormatExtension(this.config.messages.format),
        sourceLocale: this.config.extract.sourceLocale,
        warn: this.warn
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

  public getSrcPaths(): Array<string> {
    return getSrcPaths(this.config, this.projectRoot);
  }

  public async loadMessages() {
    const sourceDiskMessages = await this.loadSourceMessages();

    this.loadCatalogsPromise = this.loadTargetMessages();
    await this.loadCatalogsPromise;

    this.scanCompletePromise = (async () => {
      const sourceFiles = Array.from(
        await SourceFileScanner.getSourceFiles(this.getSrcPaths())
      )
        // Stable file order keeps catalog ties independent of processing timing
        .toSorted((a, b) => a.localeCompare(b, 'en'));
      const extractedFiles = await Promise.all(
        sourceFiles.map(async (filePath) => ({
          filePath,
          messages: await this.extractFile(filePath)
        }))
      );
      for (const {filePath, messages} of extractedFiles) {
        if (messages) {
          this.applyFileMessages(filePath, messages);
        }
      }
      this.mergeSourceDiskMetadata(sourceDiskMessages);
    })();

    await this.scanCompletePromise;

    this.getCatalogLocales().subscribeLocalesChange(this.onLocalesChange);
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
          for (const key of Object.keys(diskMessage)) {
            if (!isExtractorOwnedKey(key)) {
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
      if (existing) fillUnownedFields(existing, diskMessage);
    }
  }

  private async processFile(absoluteFilePath: string): Promise<boolean> {
    const messages = await this.extractFile(absoluteFilePath);

    // `undefined` only when `extractFile()` throws. An empty array is success
    // and must still run `applyFileMessages` to clear stale ids for this file.
    if (!messages) return false;

    return this.applyFileMessages(absoluteFilePath, messages);
  }

  private async extractFile(
    absoluteFilePath: string
  ): Promise<Array<SourceExtractedMessage> | undefined> {
    let messages: Array<SourceExtractedMessage> = [];
    try {
      const content = await fs.readFile(absoluteFilePath, 'utf8');
      try {
        messages = await this.extractor.extract(absoluteFilePath, content);
      } catch {
        return undefined;
      }
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw err;
      }
      // ENOENT -> treat as no messages
    }
    return messages;
  }

  private applyFileMessages(
    absoluteFilePath: string,
    messages: Array<SourceExtractedMessage>
  ): boolean {
    const prevFileMessages = this.sourceMessagesByFile.get(absoluteFilePath);
    const nextFileMessages = groupSourceMessagesById(messages);
    const affectedIds = new Set([
      ...(prevFileMessages?.keys() ?? []),
      ...nextFileMessages.keys()
    ]);

    if (nextFileMessages.size > 0) {
      this.sourceMessagesByFile.set(absoluteFilePath, nextFileMessages);
    } else {
      this.sourceMessagesByFile.delete(absoluteFilePath);
    }

    // Clear this file's contribution from the reverse index, then re-insert
    // fresh rows and rebuild aggregates (messagesById) per touched id.
    for (const id of affectedIds) {
      const sourceMessagesForId = this.sourceMessagesById.get(id);
      if (sourceMessagesForId) {
        sourceMessagesForId.delete(absoluteFilePath);
        // No files left for this id: drop the reverse-index entry.
        if (sourceMessagesForId.size === 0) {
          this.sourceMessagesById.delete(id);
        }
      }

      const nextSourceMessagesForId = nextFileMessages.get(id);
      if (nextSourceMessagesForId) {
        let sourceMessagesByFile = this.sourceMessagesById.get(id);
        if (!sourceMessagesByFile) {
          sourceMessagesByFile = new Map();
          this.sourceMessagesById.set(id, sourceMessagesByFile);
        }
        sourceMessagesByFile.set(absoluteFilePath, nextSourceMessagesForId);
      }

      this.rebuildMessageById(id);
    }

    const changed = this.haveMessagesChangedForFile(
      prevFileMessages,
      nextFileMessages
    );
    return changed;
  }

  private rebuildMessageById(id: string): void {
    const sourceMessages = Array.from(
      this.sourceMessagesById.get(id)?.values() ?? []
    ).flat();

    if (sourceMessages.length === 0) {
      this.messagesById.delete(id);
      return;
    }

    this.messagesById.set(
      id,
      aggregateMessage(id, sourceMessages, this.messagesById.get(id))
    );
  }

  private haveMessagesChangedForFile(
    beforeMessages: Map<string, Array<SourceExtractedMessage>> | undefined,
    afterMessages: Map<string, Array<SourceExtractedMessage>>
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
    for (const [id, prevSourceMessages] of beforeMessages) {
      const nextSourceMessages = afterMessages.get(id);
      if (!nextSourceMessages) {
        return true;
      }

      if (
        !this.areSourceMessageArraysEqual(
          prevSourceMessages,
          nextSourceMessages
        )
      ) {
        return true; // Early exit on first difference
      }
    }

    return false;
  }

  private areSourceMessageArraysEqual(
    messages1: Array<SourceExtractedMessage>,
    messages2: Array<SourceExtractedMessage>
  ): boolean {
    return (
      messages1.length === messages2.length &&
      messages1.every((message, index) =>
        this.areSourceMessagesEqual(message, messages2[index])
      )
    );
  }

  private areSourceMessagesEqual(
    msg1: SourceExtractedMessage,
    msg2: SourceExtractedMessage
  ): boolean {
    return (
      msg1.id === msg2.id &&
      msg1.message === msg2.message &&
      msg1.description === msg2.description &&
      msg1.reference.path === msg2.reference.path &&
      msg1.reference.line === msg2.reference.line &&
      msg1.reference.column === msg2.reference.column
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

    await persister.write(
      getLocaleMessages(this.messagesById, localeMessages, isSourceLocale),
      {
        locale,
        sourceMessagesById: this.messagesById
      }
    );

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

  public async update(events: Array<SourceFileEvent>) {
    const normalizedEvents = await normalizeEvents(events);
    if (normalizedEvents.length === 0) {
      return;
    }

    if (this.loadCatalogsPromise) {
      await this.loadCatalogsPromise;
    }

    // Wait for initial scan to complete to avoid race conditions
    if (this.scanCompletePromise) {
      await this.scanCompletePromise;
    }

    let changed = false;
    const expandedEvents = expandDirectoryDeleteEvents(
      normalizedEvents,
      Array.from(this.sourceMessagesByFile.keys())
    );
    // Stable file order keeps catalog ties independent of event timing.
    for (const event of expandedEvents.toSorted((a, b) =>
      a.path.localeCompare(b.path, 'en')
    )) {
      const hasChanged = await this.processFile(event.path);
      changed ||= hasChanged;
    }

    if (changed) {
      await this.save();
    }
  }

  public [Symbol.dispose](): void {
    this.saveScheduler[Symbol.dispose]();
    if (this.catalogLocales) {
      this.catalogLocales.unsubscribeLocalesChange(this.onLocalesChange);
    }
  }
}
