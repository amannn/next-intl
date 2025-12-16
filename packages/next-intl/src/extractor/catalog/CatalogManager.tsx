import fs from 'fs/promises';
import path from 'path';
import type MessageExtractor from '../extractor/MessageExtractor.js';
import type ExtractorCodec from '../format/ExtractorCodec.js';
import {getFormatExtension, resolveCodec} from '../format/index.js';
import SourceFileScanner from '../source/SourceFileScanner.js';
import SourceFileWatcher, {
  type SourceFileWatcherEvent
} from '../source/SourceFileWatcher.js';
import type {ExtractorConfig, ExtractorMessage, Locale} from '../types.js';
import type Logger from '../utils/Logger.js';
import {getDefaultProjectRoot, localeCompare} from '../utils.js';
import CatalogLocales from './CatalogLocales.js';
import CatalogPersister from './CatalogPersister.js';
import SaveScheduler from './SaveScheduler.js';

export default class CatalogManager implements Disposable {
  private config: ExtractorConfig;

  /**
   * The source of truth for which messages are used.
   * NOTE: Should be mutated in place to keep `messagesById` and `messagesByFile` in sync.
   */
  private messagesByFile: Map<
    /* File path */ string,
    Map</* ID */ string, ExtractorMessage>
  > = new Map();

  /**
   * Fast lookup for messages by ID across all files,
   * contains the same messages as `messagesByFile`.
   * NOTE: Should be mutated in place to keep `messagesById` and `messagesByFile` in sync.
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
  private logger?: Logger;

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
      logger?: Logger;
    }
  ) {
    this.config = config;
    this.logger = opts.logger;
    void this.logger?.info('CatalogManager constructor called', {
      sourceLocale: config.sourceLocale,
      isDevelopment: opts.isDevelopment ?? false
    });
    this.saveScheduler = new SaveScheduler<void>(
      50,
      this.logger?.createChild('SaveScheduler')
    );
    this.projectRoot = opts.projectRoot ?? getDefaultProjectRoot();
    this.isDevelopment = opts.isDevelopment ?? false;

    this.extractor = opts.extractor;

    if (this.isDevelopment) {
      void this.logger?.info('Creating SourceFileWatcher');
      this.sourceWatcher = new SourceFileWatcher(
        this.getSrcPaths(),
        this.handleFileEvents.bind(this),
        this.logger?.createChild('SourceFileWatcher')
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
        messagesPath: this.config.messages.path,
        codec: await this.getCodec(),
        extension: getFormatExtension(this.config.messages.format),
        logger: this.logger?.createChild('CatalogPersister')
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

  private getSrcPaths(): Array<string> {
    return (
      Array.isArray(this.config.srcPath)
        ? this.config.srcPath
        : [this.config.srcPath]
    ).map((srcPath) => path.join(this.projectRoot, srcPath));
  }

  public async loadMessages() {
    void this.logger?.info('loadMessages() called - starting');
    const startTime = Date.now();

    void this.logger?.info(
      'loadMessages() - loading source messages from disk'
    );
    const sourceLoadStart = Date.now();
    const sourceDiskMessages = await this.loadSourceMessages();
    const sourceLoadDuration = Date.now() - sourceLoadStart;
    void this.logger?.info('loadMessages() - source messages loaded', {
      durationMs: sourceLoadDuration,
      messageCount: sourceDiskMessages.size
    });

    void this.logger?.info('loadMessages() - starting target messages load');
    const targetLoadStart = Date.now();
    this.loadCatalogsPromise = this.loadTargetMessages();
    await this.loadCatalogsPromise;
    const targetLoadDuration = Date.now() - targetLoadStart;
    void this.logger?.info('loadMessages() - target messages loaded', {
      durationMs: targetLoadDuration
    });

    void this.logger?.info('loadMessages() - scanning source files');
    const scanStart = Date.now();

    // Wrap the scan and processing in a promise
    let scanDuration: number;
    let processDuration: number;
    this.scanCompletePromise = (async () => {
      const sourceFiles = await SourceFileScanner.getSourceFiles(
        this.getSrcPaths()
      );
      scanDuration = Date.now() - scanStart;
      void this.logger?.info('loadMessages() - source files scanned', {
        durationMs: scanDuration,
        fileCount: sourceFiles.size
      });

      void this.logger?.info('loadMessages() - processing source files', {
        fileCount: sourceFiles.size
      });
      const processStart = Date.now();
      await Promise.all(
        Array.from(sourceFiles).map(async (filePath) =>
          this.processFile(filePath)
        )
      );
      processDuration = Date.now() - processStart;
      void this.logger?.info('loadMessages() - source files processed', {
        durationMs: processDuration
      });

      void this.logger?.info('loadMessages() - merging source disk metadata');
      this.mergeSourceDiskMetadata(sourceDiskMessages);
    })();

    await this.scanCompletePromise;

    if (this.isDevelopment) {
      void this.logger?.info('loadMessages() - subscribing to locale changes');
      const catalogLocales = this.getCatalogLocales();
      catalogLocales.subscribeLocalesChange(this.onLocalesChange);
    }

    const totalDuration = Date.now() - startTime;
    void this.logger?.info('loadMessages() completed', {
      totalDurationMs: totalDuration,
      sourceLoadDurationMs: sourceLoadDuration,
      targetLoadDurationMs: targetLoadDuration,
      scanDurationMs: scanDuration!,
      processDurationMs: processDuration!
    });
  }

  private async loadSourceMessages(): Promise<Map<string, ExtractorMessage>> {
    void this.logger?.debug('loadSourceMessages() called', {
      sourceLocale: this.config.sourceLocale
    });
    // Load source catalog to hydrate metadata (e.g. flags) later without
    // treating catalog entries as source of truth.
    const diskMessages = await this.loadLocaleMessages(
      this.config.sourceLocale
    );
    const byId = new Map<string, ExtractorMessage>();
    for (const diskMessage of diskMessages) {
      byId.set(diskMessage.id, diskMessage);
    }
    void this.logger?.debug('loadSourceMessages() completed', {
      messageCount: byId.size
    });
    return byId;
  }

  private async loadLocaleMessages(
    locale: Locale
  ): Promise<Array<ExtractorMessage>> {
    void this.logger?.debug('loadLocaleMessages() called', {locale});
    const persister = await this.getPersister();
    const readStart = Date.now();
    const messages = await persister.read(locale);
    const readDuration = Date.now() - readStart;
    const fileTime = await persister.getLastModified(locale);
    this.lastWriteByLocale.set(locale, fileTime);
    void this.logger?.debug('loadLocaleMessages() completed', {
      locale,
      messageCount: messages.length,
      readDurationMs: readDuration,
      lastModified: fileTime?.toISOString()
    });
    return messages;
  }

  private async loadTargetMessages() {
    void this.logger?.info('loadTargetMessages() called');
    const targetLocales = await this.getTargetLocales();
    void this.logger?.info('loadTargetMessages() - target locales identified', {
      locales: targetLocales,
      count: targetLocales.length
    });
    await Promise.all(
      targetLocales.map((locale) => this.reloadLocaleCatalog(locale))
    );
    void this.logger?.info('loadTargetMessages() completed', {
      localeCount: targetLocales.length
    });
  }

  private async reloadLocaleCatalog(locale: Locale): Promise<void> {
    void this.logger?.info('reloadLocaleCatalog() called', {locale});
    const diskMessages = await this.loadLocaleMessages(locale);

    if (locale === this.config.sourceLocale) {
      void this.logger?.debug(
        'reloadLocaleCatalog() - processing source locale',
        {
          locale,
          diskMessageCount: diskMessages.length
        }
      );
      // For source: Merge additional properties like flags
      for (const diskMessage of diskMessages) {
        const prev = this.messagesById.get(diskMessage.id);
        if (prev) {
          // Mutate the existing object instead of creating a copy
          // to keep messagesById and messagesByFile in sync.
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
      void this.logger?.debug(
        'reloadLocaleCatalog() - processing target locale',
        {
          locale,
          diskMessageCount: diskMessages.length
        }
      );
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
        void this.logger?.info('reloadLocaleCatalog() - target locale loaded', {
          locale,
          translationCount: translations.size
        });
      } else if (hasExistingTranslations) {
        // We read empty but have existing translations - likely a write in progress.
        // Preserve existing translations to avoid wipeout.
        void this.logger?.warn(
          'reloadLocaleCatalog() - read empty but have existing translations, preserving',
          {
            locale,
            existingTranslationCount: existingTranslations.size
          }
        );
        // Don't replace - keep existing translations
      } else {
        // We read empty and have no existing translations - new locale, initialize empty
        const translations = new Map<string, ExtractorMessage>();
        this.translationsByTargetLocale.set(locale, translations);
        void this.logger?.info(
          'reloadLocaleCatalog() - target locale initialized empty',
          {locale}
        );
      }
    }
    void this.logger?.info('reloadLocaleCatalog() completed', {locale});
  }

  private mergeSourceDiskMetadata(
    diskMessages: Map<string, ExtractorMessage>
  ): void {
    for (const [id, diskMessage] of diskMessages) {
      const existing = this.messagesById.get(id);
      if (!existing) continue;

      // Mutate the existing object instead of creating a copy.
      // This keeps `messagesById` and `messagesByFile` in sync since
      // they reference the same object instance.
      for (const key of Object.keys(diskMessage)) {
        if (existing[key] == null) {
          existing[key] = diskMessage[key];
        }
      }
    }
  }

  private async processFile(absoluteFilePath: string): Promise<boolean> {
    void this.logger?.debug('processFile() called', {absoluteFilePath});
    const startTime = Date.now();

    let messages: Array<ExtractorMessage> = [];
    try {
      const readStart = Date.now();
      const content = await fs.readFile(absoluteFilePath, 'utf8');
      const readDuration = Date.now() - readStart;
      void this.logger?.debug('processFile() - file read', {
        absoluteFilePath,
        readDurationMs: readDuration
      });

      const extractStart = Date.now();
      let extraction: Awaited<ReturnType<typeof this.extractor.extract>>;
      try {
        extraction = await this.extractor.extract(absoluteFilePath, content);
      } catch {
        return false;
      }
      const extractDuration = Date.now() - extractStart;
      messages = extraction.messages;
      void this.logger?.debug('processFile() - extraction completed', {
        absoluteFilePath,
        extractDurationMs: extractDuration,
        messageCount: messages.length
      });
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        void this.logger?.error('processFile() - error', {
          absoluteFilePath,
          error: String(err)
        });
        throw err;
      }
      void this.logger?.debug('processFile() - file not found (ENOENT)', {
        absoluteFilePath
      });
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
        const validated = prevMessage.references ?? [];
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

    const relativeFilePath = path.relative(this.projectRoot, absoluteFilePath);

    // Clean up removed messages from `messagesById`
    idsToRemove.forEach((id) => {
      const message = this.messagesById.get(id);
      if (!message) return;

      const hasOtherReferences = message.references?.some(
        (ref) => ref.path !== relativeFilePath
      );

      if (!hasOtherReferences) {
        // No other references, delete the message entirely
        this.messagesById.delete(id);
      } else {
        // Message is used elsewhere, remove this file from references
        // Mutate the existing object to keep `messagesById` and `messagesByFile` in sync
        message.references = message.references?.filter(
          (ref) => ref.path !== relativeFilePath
        );
      }
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
    const duration = Date.now() - startTime;
    void this.logger?.debug('processFile() completed', {
      absoluteFilePath,
      changed,
      durationMs: duration,
      messageCount: messages.length,
      prevMessageCount: prevFileMessages?.size ?? 0
    });
    return changed;
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

  public async save(): Promise<void> {
    void this.logger?.info('save() called - scheduling save');
    return this.saveScheduler.schedule(() => this.saveImpl());
  }

  private async saveImpl(): Promise<void> {
    void this.logger?.info('saveImpl() called - starting save operation');
    const startTime = Date.now();

    void this.logger?.info('saveImpl() - saving source locale', {
      sourceLocale: this.config.sourceLocale
    });
    const sourceSaveStart = Date.now();
    await this.saveLocale(this.config.sourceLocale);
    const sourceSaveDuration = Date.now() - sourceSaveStart;
    void this.logger?.info('saveImpl() - source locale saved', {
      sourceLocale: this.config.sourceLocale,
      durationMs: sourceSaveDuration
    });

    const targetLocales = await this.getTargetLocales();
    void this.logger?.info('saveImpl() - saving target locales', {
      targetLocales,
      count: targetLocales.length
    });
    const targetSaveStart = Date.now();
    await Promise.all(targetLocales.map((locale) => this.saveLocale(locale)));
    const targetSaveDuration = Date.now() - targetSaveStart;
    void this.logger?.info('saveImpl() - target locales saved', {
      targetLocales,
      durationMs: targetSaveDuration
    });

    const totalDuration = Date.now() - startTime;
    void this.logger?.info('saveImpl() completed', {
      totalDurationMs: totalDuration,
      sourceSaveDurationMs: sourceSaveDuration,
      targetSaveDurationMs: targetSaveDuration
    });
  }

  private async saveLocale(locale: Locale): Promise<void> {
    void this.logger?.info('saveLocale() called', {locale});
    const startTime = Date.now();

    void this.logger?.debug('saveLocale() - waiting for loadCatalogsPromise', {
      locale
    });
    await this.loadCatalogsPromise;
    void this.logger?.debug('saveLocale() - loadCatalogsPromise resolved', {
      locale
    });

    const messages = Array.from(this.messagesById.values());
    void this.logger?.debug('saveLocale() - messages collected', {
      locale,
      messageCount: messages.length
    });

    const persister = await this.getPersister();
    const isSourceLocale = locale === this.config.sourceLocale;

    // Check if file was modified externally (poll-at-save is cheaper than
    // watchers here since stat() is fast and avoids continuous overhead)
    const lastWriteTime = this.lastWriteByLocale.get(locale);
    const currentFileTime = await persister.getLastModified(locale);
    void this.logger?.debug('saveLocale() - checking file modification time', {
      locale,
      lastWriteTime: lastWriteTime?.toISOString(),
      currentFileTime: currentFileTime?.toISOString(),
      needsReload:
        currentFileTime && lastWriteTime && currentFileTime > lastWriteTime
    });
    if (currentFileTime && lastWriteTime && currentFileTime > lastWriteTime) {
      void this.logger?.warn(
        'saveLocale() - file modified externally, reloading',
        {
          locale,
          lastWriteTime: lastWriteTime.toISOString(),
          currentFileTime: currentFileTime.toISOString()
        }
      );
      await this.reloadLocaleCatalog(locale);
    }

    const localeMessages = isSourceLocale
      ? this.messagesById
      : this.translationsByTargetLocale.get(locale);

    void this.logger?.debug('saveLocale() - preparing messages to persist', {
      locale,
      isSourceLocale,
      localeMessageCount: localeMessages?.size ?? 0,
      sourceMessageCount: this.messagesById.size
    });

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

    const emptyMessageCount = messagesToPersist.filter(
      (m) => !m.message
    ).length;
    void this.logger?.debug('saveLocale() - messages prepared', {
      locale,
      messagesToPersistCount: messagesToPersist.length,
      emptyMessageCount
    });

    // Critical error detection: all messages are empty strings (wipeout bug)
    if (
      messagesToPersist.length > 0 &&
      emptyMessageCount === messagesToPersist.length
    ) {
      void this.logger?.error(
        '🚨 CRITICAL: All messages prepared for save are empty strings (wipeout detected in saveLocale)',
        {
          locale,
          isSourceLocale,
          messagesToPersistCount: messagesToPersist.length,
          sourceMessageCount: this.messagesById.size,
          localeMessageCount: localeMessages?.size ?? 0,
          hasLocaleMessages: !!localeMessages,
          sampleMessageIds: messagesToPersist.map((m) => m.id).slice(0, 20),
          sampleLocaleMessages: localeMessages
            ? Array.from(localeMessages.values())
                .slice(0, 5)
                .map((m) => ({id: m.id, hasMessage: !!m.message}))
            : [],
          lastWriteTime: lastWriteTime?.toISOString(),
          currentFileTime: currentFileTime?.toISOString(),
          wasReloaded:
            currentFileTime && lastWriteTime && currentFileTime > lastWriteTime,
          stackTrace: new Error().stack
        }
      );
    }

    const writeStart = Date.now();
    await persister.write(messagesToPersist, {
      locale,
      sourceMessagesById: this.messagesById
    });
    const writeDuration = Date.now() - writeStart;
    void this.logger?.info('saveLocale() - write completed', {
      locale,
      writeDurationMs: writeDuration,
      messageCount: messagesToPersist.length
    });

    // Update timestamps
    const newTime = await persister.getLastModified(locale);
    this.lastWriteByLocale.set(locale, newTime);
    const duration = Date.now() - startTime;
    void this.logger?.info('saveLocale() completed', {
      locale,
      durationMs: duration,
      writeDurationMs: writeDuration,
      newTimestamp: newTime?.toISOString()
    });
  }

  private onLocalesChange = async (params: {
    added: Array<Locale>;
    removed: Array<Locale>;
  }): Promise<void> => {
    void this.logger?.info('onLocalesChange() called', {
      added: params.added,
      removed: params.removed
    });
    // Chain to existing promise
    this.loadCatalogsPromise = Promise.all([
      this.loadCatalogsPromise,
      ...params.added.map((locale) => this.reloadLocaleCatalog(locale))
    ]);

    for (const locale of params.added) {
      void this.logger?.info('onLocalesChange() - saving added locale', {
        locale
      });
      await this.saveLocale(locale);
    }

    for (const locale of params.removed) {
      void this.logger?.info('onLocalesChange() - removing locale', {locale});
      this.translationsByTargetLocale.delete(locale);
      this.lastWriteByLocale.delete(locale);
    }
    void this.logger?.info('onLocalesChange() completed', {
      added: params.added,
      removed: params.removed
    });
  };

  private async handleFileEvents(events: Array<SourceFileWatcherEvent>) {
    void this.logger?.info('handleFileEvents() called', {
      eventCount: events.length,
      events: events.map((e) => ({type: e.type, path: e.path}))
    });
    const startTime = Date.now();

    if (this.loadCatalogsPromise) {
      void this.logger?.debug(
        'handleFileEvents() - waiting for loadCatalogsPromise'
      );
      await this.loadCatalogsPromise;
      void this.logger?.debug(
        'handleFileEvents() - loadCatalogsPromise resolved'
      );
    }

    // Wait for initial scan to complete to avoid race conditions
    if (this.scanCompletePromise) {
      void this.logger?.debug(
        'handleFileEvents() - waiting for scanCompletePromise'
      );
      await this.scanCompletePromise;
      void this.logger?.debug(
        'handleFileEvents() - scanCompletePromise resolved'
      );
    }

    let changed = false;
    const expandedEvents =
      await this.sourceWatcher!.expandDirectoryDeleteEvents(
        events,
        Array.from(this.messagesByFile.keys())
      );
    for (const event of expandedEvents) {
      void this.logger?.debug('handleFileEvents() - processing event', {
        type: event.type,
        path: event.path
      });
      // parallelize this? or could this be problematic?
      const hasChanged = await this.processFile(event.path);
      changed ||= hasChanged;
      void this.logger?.debug('handleFileEvents() - event processed', {
        type: event.type,
        path: event.path,
        hasChanged
      });
    }

    if (changed) {
      void this.logger?.info(
        'handleFileEvents() - changes detected, triggering save'
      );
      await this.save();
    } else {
      void this.logger?.debug('handleFileEvents() - no changes detected');
    }

    const duration = Date.now() - startTime;
    void this.logger?.info('handleFileEvents() completed', {
      eventCount: events.length,
      changed,
      durationMs: duration
    });
  }

  public [Symbol.dispose](): void {
    void this.logger?.info('CatalogManager dispose() called');
    this.sourceWatcher?.stop();
    this.sourceWatcher = undefined;

    this.saveScheduler[Symbol.dispose]();
    if (this.catalogLocales && this.isDevelopment) {
      this.catalogLocales.unsubscribeLocalesChange(this.onLocalesChange);
    }
  }
}
