import {promises as fs} from 'fs';
import {
  extractFileMessages,
  loadSourceMessages
} from 'next-intl-extracted/dist/extractor/index.js';
import type {ExtractedMessage, Locale} from './types.ts';
import type Formatter from './formatters/Formatter.ts';
import path from 'path';
import SourceFileAnalyzer from './source/SourceFileAnalyzer.ts';

const formatters = {
  json: () => import('./formatters/JSONFormatter.ts')
};

type Format = keyof typeof formatters;

export type ExtractorConfig = {
  sourceLocale: Locale;
  messagesPath: string;
  srcPath: string;
  formatter: Format;
};

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

  // Cached
  private formatter?: Formatter;
  private targetLocales?: Array<Locale>;

  constructor(config: ExtractorConfig) {
    this.config = config;
    this.messagesByFile = new Map();
  }

  private async getFormatter() {
    if (this.formatter) {
      return this.formatter;
    } else {
      const FormatterImpl = (await formatters[this.config.formatter]()).default;
      this.formatter = new FormatterImpl(this.config.messagesPath);
      return this.formatter;
    }
  }

  private async getTargetLocales(): Promise<Array<Locale>> {
    if (this.targetLocales) {
      return this.targetLocales;
    } else {
      const messagesDir = path.join(
        this.getProjectRoot(),
        this.config.messagesPath
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

  private getProjectRoot() {
    return process.cwd();
  }

  getSrcPath() {
    return path.join(this.getProjectRoot(), this.config.srcPath);
  }

  getFileMessages(
    absoluteFilePath: string
  ): Map<string, ExtractedMessage> | undefined {
    return this.messagesByFile.get(absoluteFilePath);
  }

  async loadMessages() {
    await this.loadSourceMessages();
    await this.loadTargetMessages();
  }

  private async loadSourceMessages() {
    const fileMessages = await loadSourceMessages(
      this.getSrcPath(),
      SourceFileAnalyzer.EXTENSIONS,
      SourceFileAnalyzer.IGNORED_DIRECTORIES
    );
    for (const fileMessage of fileMessages) {
      const messagesMap = new Map<string, ExtractedMessage>();
      for (const message of fileMessage.messages) {
        messagesMap.set(message.id, message);
      }
      this.messagesByFile.set(fileMessage.filePath, messagesMap);
    }
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

  async extractFileMessages(absoluteFilePath: string): Promise<number> {
    const messages = await extractFileMessages(absoluteFilePath);

    // If messages were removed from a file, we need to clean them up
    const newMessagesMap = new Map<string, ExtractedMessage>();
    for (const message of messages) {
      newMessagesMap.set(message.id, message);
    }

    // Update the stored messages
    const hasMessages = messages.length > 0;
    if (hasMessages) {
      this.messagesByFile.set(absoluteFilePath, newMessagesMap);
    } else {
      this.messagesByFile.delete(absoluteFilePath);
    }

    return messages.length;
  }

  async save(): Promise<number> {
    // Sort and group by file paths
    // TODO: Is this always wanted?
    const messages = Array.from(this.messagesByFile.keys())
      .sort()
      .map((filePath) =>
        Array.from((this.messagesByFile.get(filePath) || new Map()).values())
      )
      .flat();

    const formatter = await this.getFormatter();
    await formatter.write(this.config.sourceLocale, messages);

    // TODO: This might be slow. Maybe it's better to use a bit more memory
    // and update messages in a granular way as updates come in.
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
}
