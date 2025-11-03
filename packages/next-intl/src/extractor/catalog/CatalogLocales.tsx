import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import type {Locale} from '../types.js';

type LocaleChangeCallback = (params: {
  added: Array<Locale>;
  removed: Array<Locale>;
}) => unknown;

type CatalogLocalesParams = {
  messagesDir: string;
  sourceLocale: Locale;
  extension: string;
};

export default class CatalogLocales {
  private messagesDir: string;
  private extension: string;
  private sourceLocale: Locale;
  private watcher?: fs.FSWatcher;
  private debounceTimeout?: NodeJS.Timeout;
  private debounceDelayMs = 50;
  private cleanupHandlers: Array<() => void> = [];
  private targetLocales?: Array<Locale>;
  private onChangeCallbacks: Set<LocaleChangeCallback> = new Set();

  constructor(params: CatalogLocalesParams) {
    this.messagesDir = params.messagesDir;
    this.sourceLocale = params.sourceLocale;
    this.extension = params.extension;
  }

  async getTargetLocales(): Promise<Array<Locale>> {
    if (this.targetLocales) {
      return this.targetLocales;
    }

    this.targetLocales = await this.readTargetLocales();
    return this.targetLocales;
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

  subscribeLocalesChange(callback: LocaleChangeCallback): void {
    this.onChangeCallbacks.add(callback);

    if (!this.watcher) {
      void this.startWatcher();
    }
  }

  unsubscribeLocalesChange(callback: LocaleChangeCallback): void {
    this.onChangeCallbacks.delete(callback);
    if (this.onChangeCallbacks.size === 0) {
      this.stopWatcher();
    }
  }

  private async startWatcher(): Promise<void> {
    if (this.watcher) {
      return;
    }

    await fsPromises.mkdir(this.messagesDir, {recursive: true});

    this.watcher = fs.watch(
      this.messagesDir,
      {persistent: false, recursive: false},
      (event, filename) => {
        if (
          filename &&
          filename.endsWith(this.extension) &&
          !filename.includes(path.sep)
        ) {
          this.debouncedOnChange();
        }
      }
    );

    this.setupCleanupHandlers();
  }

  private stopWatcher(): void {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = undefined;
    }

    if (this.watcher) {
      this.watcher.close();
      this.watcher = undefined;
    }

    for (const handler of this.cleanupHandlers) {
      handler();
    }
    this.cleanupHandlers = [];
  }

  private debouncedOnChange(): void {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = setTimeout(() => {
      void (async () => {
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
      })();
    }, this.debounceDelayMs);
  }

  private setupCleanupHandlers(): void {
    const cleanup = () => {
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }
      if (this.watcher) {
        this.watcher.close();
        this.watcher = undefined;
      }
    };

    function exitHandler() {
      cleanup();
    }
    function sigintHandler() {
      cleanup();
      process.exit(0);
    }
    function sigtermHandler() {
      cleanup();
      process.exit(0);
    }

    process.once('exit', exitHandler);
    process.once('SIGINT', sigintHandler);
    process.once('SIGTERM', sigtermHandler);

    this.cleanupHandlers.push(() => {
      process.removeListener('exit', exitHandler);
      process.removeListener('SIGINT', sigintHandler);
      process.removeListener('SIGTERM', sigtermHandler);
    });
  }
}
