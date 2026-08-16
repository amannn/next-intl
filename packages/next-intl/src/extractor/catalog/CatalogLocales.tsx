import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import type {CatalogSplit, ExtractorConfig, Locale} from '../types.js';

type LocaleChangeCallback = (params: {
  added: Array<Locale>;
  removed: Array<Locale>;
}) => unknown;

type CatalogLocalesParams = {
  messagesDir: string;
  sourceLocale: Locale;
  extension: string;
  locales: ExtractorConfig['extract']['locales'];
  split?: CatalogSplit;
};

export default class CatalogLocales {
  private messagesDir: string;
  private extension: string;
  private sourceLocale: Locale;
  private locales: ExtractorConfig['extract']['locales'];
  private split?: CatalogSplit;
  private watcher?: fs.FSWatcher;
  private targetLocales?: Array<Locale>;
  private onChangeCallbacks: Set<LocaleChangeCallback> = new Set();

  public constructor(params: CatalogLocalesParams) {
    this.messagesDir = params.messagesDir;
    this.sourceLocale = params.sourceLocale;
    this.extension = params.extension;
    this.locales = params.locales;
    this.split = params.split;
  }

  public async getTargetLocales(): Promise<Array<Locale>> {
    if (this.targetLocales) {
      return this.targetLocales;
    }

    if (this.locales === 'infer') {
      this.targetLocales = await this.readTargetLocales();
    } else {
      this.targetLocales = this.locales.filter(
        (locale) => locale !== this.sourceLocale
      );
    }
    return this.targetLocales;
  }

  private addLocaleFromFileName(fileName: string, locales: Set<Locale>): void {
    if (!fileName.endsWith(this.extension)) {
      return;
    }
    const locale = path.basename(fileName, this.extension);
    if (locale.length > 0) {
      locales.add(locale);
    }
  }

  private async readTargetLocales(): Promise<Array<Locale>> {
    try {
      const locales = new Set<Locale>();
      const entries = await fsPromises.readdir(this.messagesDir, {
        withFileTypes: true
      });

      for (const entry of entries) {
        if (entry.isFile()) {
          this.addLocaleFromFileName(entry.name, locales);
          continue;
        }

        if (this.split !== 'namespace' || !entry.isDirectory()) {
          continue;
        }

        const nestedEntries = await fsPromises.readdir(
          path.join(this.messagesDir, entry.name),
          {withFileTypes: true}
        );
        for (const nestedEntry of nestedEntries) {
          if (nestedEntry.isFile()) {
            this.addLocaleFromFileName(nestedEntry.name, locales);
          }
        }
      }

      return Array.from(locales).filter(
        (locale) => locale !== this.sourceLocale
      );
    } catch {
      return [];
    }
  }

  public subscribeLocalesChange(callback: LocaleChangeCallback): void {
    this.onChangeCallbacks.add(callback);

    if (this.locales === 'infer' && !this.watcher) {
      void this.startWatcher();
    }
  }

  public unsubscribeLocalesChange(callback: LocaleChangeCallback): void {
    this.onChangeCallbacks.delete(callback);
    if (this.onChangeCallbacks.size === 0) {
      this.stopWatcher();
    }
  }

  private isCatalogFileName(filename: string): boolean {
    if (!filename.endsWith(this.extension)) {
      return false;
    }
    if (this.split === 'namespace') {
      return true;
    }
    return !filename.includes(path.sep);
  }

  private async startWatcher(): Promise<void> {
    if (this.watcher) {
      return;
    }

    await fsPromises.mkdir(this.messagesDir, {recursive: true});

    this.watcher = fs.watch(
      this.messagesDir,
      {persistent: false, recursive: this.split === 'namespace'},
      (event, filename) => {
        if (filename != null && this.isCatalogFileName(filename)) {
          void this.onChange();
        }
      }
    );
  }

  private stopWatcher(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = undefined;
    }
  }

  private async onChange(): Promise<void> {
    const oldLocales = new Set(this.targetLocales || []);
    this.targetLocales = await this.readTargetLocales();
    const newLocalesSet = new Set(this.targetLocales);

    const added = this.targetLocales.filter(
      (locale) => !oldLocales.has(locale)
    );
    const removed = Array.from(oldLocales).filter(
      (locale) => !newLocalesSet.has(locale)
    );

    if (added.length > 0 || removed.length > 0) {
      for (const callback of this.onChangeCallbacks) {
        callback({added, removed});
      }
    }
  }
}
