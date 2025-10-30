import fs from 'fs/promises';
import fsPath from 'path';
import type Formatter from '../formatters/Formatter.js';
import type {ExtractedMessage, Locale} from '../types.js';

export default class CatalogPersister {
  private messagesPath: string;
  private formatter: Formatter;

  constructor(messagesPath: string, formatter: Formatter) {
    this.messagesPath = messagesPath;
    this.formatter = formatter;
  }

  private getFilePath(locale: Locale): string {
    return fsPath.join(this.messagesPath, locale + this.formatter.EXTENSION);
  }

  async read(locale: Locale): Promise<Array<ExtractedMessage>> {
    const filePath = this.getFilePath(locale);
    const content = await fs.readFile(filePath, 'utf8');
    return this.formatter.parse(content, {locale});
  }

  async write(
    locale: Locale,
    messages: Array<ExtractedMessage>
  ): Promise<void> {
    const filePath = this.getFilePath(locale);
    const content = this.formatter.serialize(messages, {locale});
    try {
      const outputDir = fsPath.dirname(filePath);
      await fs.mkdir(outputDir, {recursive: true});
      await fs.writeFile(filePath, content);
    } catch (error) {
      console.error(`❌ Failed to write catalog: ${error}`);
    }
  }

  async getLastModified(locale: Locale): Promise<Date | undefined> {
    const filePath = this.getFilePath(locale);
    try {
      const stats = await fs.stat(filePath);
      return stats.mtime;
    } catch {
      return undefined;
    }
  }
}
