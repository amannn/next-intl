import fs from 'fs/promises';
import fsPath from 'path';
import type ExtractorCodec from '../format/ExtractorCodec.js';
import type {ExtractedMessage, Locale} from '../types.js';

export default class CatalogPersister {
  private messagesPath: string;
  private codec: ExtractorCodec;
  private extension: string;

  constructor(params: {
    messagesPath: string;
    codec: ExtractorCodec;
    extension: string;
  }) {
    this.messagesPath = params.messagesPath;
    this.codec = params.codec;
    this.extension = params.extension;
  }

  private getFileName(locale: Locale): string {
    return locale + this.extension;
  }

  private getFilePath(locale: Locale): string {
    return fsPath.join(this.messagesPath, this.getFileName(locale));
  }

  async read(locale: Locale): Promise<Array<ExtractedMessage>> {
    const filePath = this.getFilePath(locale);
    let content: string;
    try {
      content = await fs.readFile(filePath, 'utf8');
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'ENOENT'
      ) {
        return [];
      }
      throw new Error(
        `Error while reading ${this.getFileName(locale)}:\n> ${error}`,
        {cause: error}
      );
    }
    try {
      return this.codec.decode(content, {locale});
    } catch (error) {
      throw new Error(
        `Error while decoding ${this.getFileName(locale)}:\n> ${error}`,
        {cause: error}
      );
    }
  }

  async write(
    locale: Locale,
    messages: Array<ExtractedMessage>
  ): Promise<void> {
    const filePath = this.getFilePath(locale);
    const content = this.codec.encode(messages, {locale});
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
