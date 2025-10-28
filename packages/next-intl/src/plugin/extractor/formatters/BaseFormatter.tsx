import fs from 'fs/promises';
import fsPath from 'path';
import type {ExtractedMessage, Locale} from '../types.js';
import type Formatter from './Formatter.js';

export default abstract class BaseFormatter implements Formatter {
  public abstract readonly EXTENSION: `.${string}`;

  protected messagesPath: string;

  constructor(messagesPath: string) {
    this.messagesPath = messagesPath;
  }

  protected getFilePath(locale: Locale): string {
    return fsPath.join(this.messagesPath, locale + this.EXTENSION);
  }

  protected async readCatalogFile(locale: Locale): Promise<string> {
    const filePath = this.getFilePath(locale);
    return await fs.readFile(filePath, 'utf8');
  }

  protected async writeCatalogFile(
    locale: Locale,
    content: string
  ): Promise<void> {
    const filePath = this.getFilePath(locale);
    try {
      const outputDir = fsPath.dirname(filePath);
      await fs.mkdir(outputDir, {recursive: true});
      await fs.writeFile(filePath, content);
    } catch (error) {
      console.error(`❌ Failed to write catalog: ${error}`);
    }
  }

  public async getLastModified(locale: Locale): Promise<Date | undefined> {
    const filePath = this.getFilePath(locale);
    try {
      const stats = await fs.stat(filePath);
      return stats.mtime;
    } catch {
      return undefined;
    }
  }

  // Abstract methods that subclasses must implement
  abstract read(targetLocale: Locale): Promise<Array<ExtractedMessage>>;
  abstract write(
    locale: Locale,
    messages: Array<ExtractedMessage>
  ): Promise<void>;
}
