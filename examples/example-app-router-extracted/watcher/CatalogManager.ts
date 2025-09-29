import {promises as fs} from 'fs';
import MessageExtractor from './extractor/MessageExtractor.ts';
import SourceFileScanner from './source/SourceFileScanner.ts';
import type {ExtractedMessage} from './types.ts';
import type Formatter from './formatters/Formatter.ts';
import path from 'path';

const formatters = {
  json: () => import('./formatters/JSONFormatter.ts')
};

type Format = keyof typeof formatters;

export type ExtractorConfig = {
  sourceLocale: string;
  messagesPath: string;
  srcPath: string;
  formatter: Format;
};

export default class CatalogManager {
  private config: ExtractorConfig;
  private messagesByFile: Map<string, Array<ExtractedMessage>> = new Map();
  private extractor: MessageExtractor;
  private formatter?: Formatter;

  constructor(config: ExtractorConfig) {
    this.config = config;
    this.extractor = new MessageExtractor();
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

  private async getTargetLocales() {
    const messagesDir = path.join(
      this.getProjectRoot(),
      this.config.messagesPath
    );
    const files = await fs.readdir(messagesDir);
    const formatter = await this.getFormatter();
    return files
      .filter((file) => file.endsWith(formatter.EXTENSION))
      .map((file) => path.basename(file, formatter.EXTENSION))
      .filter((locale) => locale !== this.config.sourceLocale);
  }

  private getProjectRoot() {
    return process.cwd();
  }

  getSrcPath() {
    return path.join(this.getProjectRoot(), this.config.srcPath);
  }

  async initFromSource() {
    const sourceFiles = await SourceFileScanner.getSourceFiles(
      this.getSrcPath()
    );
    await Promise.all(
      sourceFiles.map(async (filePath) => this.extractFileMessages(filePath))
    );
  }

  async extractFileMessages(absoluteFilePath: string): Promise<number> {
    const content = await fs.readFile(absoluteFilePath, 'utf8');
    const messages = await this.extractor.extractFromFileContent(content);

    // If messages were removed from a file, we need to clean them up
    const hadMessages = this.messagesByFile.has(absoluteFilePath);
    const hasMessages = messages.length > 0;

    if (hasMessages || hadMessages) {
      if (hasMessages) {
        this.messagesByFile.set(absoluteFilePath, messages);
      } else {
        this.messagesByFile.delete(absoluteFilePath);
      }
    }

    return messages.length;
  }

  async save(): Promise<number> {
    // Sort and group by file paths
    // TODO: Is this always wanted?
    const messages = Array.from(this.messagesByFile.keys())
      .sort()
      .map((filePath) => this.messagesByFile.get(filePath) || [])
      .flat();
    const formatter = await this.getFormatter();
    await formatter.write(this.config.sourceLocale, messages);
    return messages.length;
  }
}
