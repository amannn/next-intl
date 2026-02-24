import fsPromises from 'fs/promises';
import path from 'path';
import type {Locale, MessagesConfig} from '../types.js';

type CatalogLocalesParams = {
  messagesDir: string;
  sourceLocale: Locale;
  extension: string;
  locales: MessagesConfig['locales'];
};

export default class CatalogLocales {
  private messagesDir: string;
  private extension: string;
  private sourceLocale: Locale;
  private locales: MessagesConfig['locales'];

  public constructor(params: CatalogLocalesParams) {
    this.messagesDir = params.messagesDir;
    this.sourceLocale = params.sourceLocale;
    this.extension = params.extension;
    this.locales = params.locales;
  }

  public async getTargetLocales(): Promise<Array<Locale>> {
    if (this.locales === 'infer') {
      return await this.readTargetLocales();
    } else {
      return this.locales.filter((locale) => locale !== this.sourceLocale);
    }
  }

  private async readTargetLocales(): Promise<Array<Locale>> {
    try {
      const files = await fsPromises.readdir(this.messagesDir);
      return files
        .filter((file) => file.endsWith(this.extension))
        .map((file) => path.basename(file, this.extension))
        .filter((locale) => locale !== this.sourceLocale);
    } catch {
      return [];
    }
  }
}
