import fs from 'fs/promises';
import path from 'path';
import type {Locale} from '../types.js';

export type OrphanedEntry = {message: string};

type CacheData = Partial<
  Record<Locale, Partial<Record<string, OrphanedEntry>>>
>;

const CACHE_DIR = '.next/cache';
const CACHE_FILE = 'next-intl-extractor-orphaned.json';

export default class OrphanedTranslationsCache {
  private cachePath: string;
  private data: CacheData = {};
  private loaded = false;

  public constructor(projectRoot: string) {
    this.cachePath = path.join(projectRoot, CACHE_DIR, CACHE_FILE);
  }

  private async load(): Promise<void> {
    if (this.loaded) return;
    this.loaded = true;
    try {
      const content = await fs.readFile(this.cachePath, 'utf8');
      this.data = JSON.parse(content) as CacheData;
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'ENOENT'
      ) {
        this.data = {};
      } else {
        throw error;
      }
    }
  }

  private async persist(): Promise<void> {
    const dir = path.dirname(this.cachePath);
    await fs.mkdir(dir, {recursive: true});
    await fs.writeFile(this.cachePath, JSON.stringify(this.data));
  }

  public async get(
    locale: Locale,
    messageId: string
  ): Promise<OrphanedEntry | undefined> {
    await this.load();
    const localeData = this.data[locale];
    if (!localeData) return undefined;
    const entry = localeData[messageId];
    if (!entry) return undefined;
    delete localeData[messageId];
    if (Object.keys(localeData).length === 0) {
      delete this.data[locale];
    }
    await this.persist();
    return entry;
  }

  public async add(
    locale: Locale,
    messageId: string,
    entry: OrphanedEntry
  ): Promise<void> {
    await this.load();
    this.data[locale] ??= {};
    this.data[locale][messageId] = entry;
    await this.persist();
  }
}
