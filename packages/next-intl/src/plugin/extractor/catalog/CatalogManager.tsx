import fs from 'fs/promises';
import path from 'path';
import MessageExtractor from '../extractor/MessageExtractor.js';
import type Formatter from '../formatters/Formatter.js';
import formatters from '../formatters/index.js';
import SourceFileScanner from '../source/SourceFileScanner.js';
import type {ExtractedMessage, ExtractorConfig, Locale} from '../types.js';
import SaveScheduler from './SaveScheduler.js';

export default class CatalogManager {
  private config: ExtractorConfig;

  /* The source of truth for which messages are used. */
  private messagesByFile: Map<
    /* File path */ string,
    Map</* ID */ string, ExtractedMessage>
  > = new Map();

  /**
   * This potentially also includes outdated ones that were initially available,
   * but are not used anymore. This allows to restore them if they are used again.
   **/
  private translationsByTargetLocale: Map<Locale, Map<string, string>> =
    new Map();

  private lastWriteByLocale: Map<Locale, Date | undefined> = new Map();

  private saveScheduler: SaveScheduler<number>;
  private projectRoot: string;

  // Caching
  private formatter?: Formatter;
  private targetLocales?: Array<Locale>;
  private messageExtractor: MessageExtractor;

  constructor(
    config: ExtractorConfig,
    opts: {projectRoot?: string; isDevelopment: boolean}
  ) {
    this.config = config;
    this.messagesByFile = new Map();
    this.saveScheduler = new SaveScheduler<number>(50);
    this.projectRoot = opts.projectRoot || process.cwd();

    this.messageExtractor = new MessageExtractor({
      isDevelopment: opts.isDevelopment,
      projectRoot: this.projectRoot
    });
  }

  private async getFormatter() {
    if (this.formatter) {
      return this.formatter;
    } else {
      const FormatterImpl = (await formatters[this.config.messages.format]())
        .default;
      this.formatter = new FormatterImpl(this.config.messages.path);
      return this.formatter;
    }
  }

  private async getTargetLocales(): Promise<Array<Locale>> {
    if (this.targetLocales) {
      return this.targetLocales;
    } else {
      const messagesDir = path.join(
        this.projectRoot,
        this.config.messages.path
      );

      try {
        const files = await fs.readdir(messagesDir);
        const formatter = await this.getFormatter();
        this.targetLocales = files
          .filter((file) => file.endsWith(formatter.EXTENSION))
          .map((file) => path.basename(file, formatter.EXTENSION))
          .filter((locale) => locale !== this.config.sourceLocale);
      } catch {
        this.targetLocales = [];
      }

      return this.targetLocales;
    }
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
    // TODO: We could potentially skip this in favor of reading
    // the existing messages for the .po format since it provides
    // all the necessary context by itself.
    await this.loadSourceMessages();

    await this.loadTargetMessages();
  }

  private async loadSourceMessages() {
    const sourceFiles = await SourceFileScanner.getSourceFiles(
      this.getSrcPaths()
    );

    await Promise.all(
      sourceFiles.map(async (filePath) =>
        this.extractFileMessages(filePath, await fs.readFile(filePath, 'utf8'))
      )
    );
  }

  private async loadTargetMessages() {
    const targetLocales = await this.getTargetLocales();
    const formatter = await this.getFormatter();

    for (const locale of targetLocales) {
      this.translationsByTargetLocale.set(locale, new Map());
    }

    await Promise.all(
      targetLocales.map(async (locale) => {
        const messages = await formatter.read(locale);
        for (const message of messages) {
          const translations = this.translationsByTargetLocale.get(locale)!;
          translations.set(message.id, message.message);
        }

        // Initialize last modified
        const fileTime = await formatter.getLastModified(locale);
        this.lastWriteByLocale.set(locale, fileTime);
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
    const prevFileMessages = this.messagesByFile.get(absoluteFilePath);
    const result = await this.messageExtractor.processFileContent(
      absoluteFilePath,
      source
    );

    // If messages were removed from a file, we need to clean them up
    const fileMessages = new Map<string, ExtractedMessage>();
    for (const message of result.messages) {
      fileMessages.set(message.id, message);
    }

    // Check for changes before updating
    const changed = this.haveMessagesChanged(prevFileMessages, fileMessages);

    // Update the stored messages
    const hasMessages = result.messages.length > 0;

    if (hasMessages) {
      this.messagesByFile.set(absoluteFilePath, fileMessages);
    } else {
      this.messagesByFile.delete(absoluteFilePath);
    }

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
    const messages = Array.from(this.messagesByFile.values()).flatMap(
      (fileMessages) => Array.from(fileMessages.values())
    );

    const formatter = await this.getFormatter();
    await formatter.write(this.config.sourceLocale, messages);

    for (const locale of await this.getTargetLocales()) {
      // Check if file was modified externally
      const lastWriteTime = this.lastWriteByLocale.get(locale);
      const currentFileTime = await formatter.getLastModified(locale);

      // If file was modified externally, read and merge
      if (currentFileTime && lastWriteTime && currentFileTime > lastWriteTime) {
        const diskMessages = await formatter.read(locale);
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

      await formatter.write(locale, localeMessages);

      // Update timestamps
      const newTime = await formatter.getLastModified(locale);
      this.lastWriteByLocale.set(locale, newTime);
    }

    return messages.length;
  }

  destroy(): void {
    this.saveScheduler.destroy();
  }
}
