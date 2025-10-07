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
  private messagesByFile: Map<string, Map<string, ExtractedMessage>> =
    new Map();

  /**
   * This potentially also includes outdated ones that were initially available,
   * but are not used anymore. This allows to restore them if they are used again.
   **/
  private translationsByTargetLocale: Map<Locale, Map<string, string>> =
    new Map();

  private saveScheduler: SaveScheduler<number>;
  private projectRoot: string;

  // Caching
  private formatter?: Formatter;
  private targetLocales?: Array<Locale>;
  private messageExtractor: MessageExtractor;

  constructor(config: ExtractorConfig, opts?: {projectRoot?: string}) {
    this.config = config;
    this.messagesByFile = new Map();
    this.saveScheduler = new SaveScheduler<number>(50);
    this.messageExtractor = new MessageExtractor();
    this.projectRoot = opts?.projectRoot || process.cwd();
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
      const files = await fs.readdir(messagesDir);
      const formatter = await this.getFormatter();
      this.targetLocales = files
        .filter((file) => file.endsWith(formatter.EXTENSION))
        .map((file) => path.basename(file, formatter.EXTENSION))
        .filter((locale) => locale !== this.config.sourceLocale);
      return this.targetLocales;
    }
  }

  getSrcPaths(): Array<string> {
    return (
      Array.isArray(this.config.src) ? this.config.src : [this.config.src]
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
      })
    );
  }

  async extractFileMessages(
    absoluteFilePath: string,
    source: string
  ): Promise<{messages: Array<ExtractedMessage>; source: string}> {
    const result = await this.messageExtractor.processFileContent(
      absoluteFilePath,
      source
    );

    // If messages were removed from a file, we need to clean them up
    const newMessagesMap = new Map<string, ExtractedMessage>();
    for (const message of result.messages) {
      newMessagesMap.set(message.id, message);
    }

    // Update the stored messages
    const hasMessages = result.messages.length > 0;

    if (hasMessages) {
      this.messagesByFile.set(absoluteFilePath, newMessagesMap);
    } else {
      this.messagesByFile.delete(absoluteFilePath);
    }

    return result;
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
      const translations = this.translationsByTargetLocale.get(locale)!;
      const localeMessages = messages.map((message) => ({
        ...message,
        message: translations.get(message.id) || ''
      }));
      await formatter.write(locale, localeMessages);
    }

    return messages.length;
  }

  destroy(): void {
    this.saveScheduler.destroy();
  }
}
