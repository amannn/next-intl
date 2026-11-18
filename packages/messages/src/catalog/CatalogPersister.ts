import {randomUUID} from 'crypto';
import fs from 'fs/promises';
import fsPath from 'path';
import type ExtractorCodec from '../format/ExtractorCodec.js';
import type {ExtractorMessage, Locale} from '../types.js';
import {warnAboutMissingReferences} from '../utils.js';

export default class CatalogPersister {
  private getFilePath: (locale: Locale) => string;
  private codec: ExtractorCodec;
  private sourceLocale: Locale;
  private warn: (message: string) => void;

  public constructor(params: {
    getFilePath(locale: Locale): string;
    codec: ExtractorCodec;
    sourceLocale: Locale;
    warn?(message: string): void;
  }) {
    this.getFilePath = params.getFilePath;
    this.codec = params.codec;
    this.sourceLocale = params.sourceLocale;
    this.warn = params.warn ?? console.warn;
  }

  private getDisplayPath(locale: Locale): string {
    return fsPath.relative(process.cwd(), this.getFilePath(locale));
  }

  public async read(locale: Locale): Promise<Array<ExtractorMessage>> {
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
        `Error while reading ${this.getDisplayPath(locale)}:\n> ${error}`,
        {cause: error}
      );
    }
    try {
      const messages = this.codec.decode(content, {
        locale,
        sourceLocale: this.sourceLocale
      });
      assertNoArrayMessages(messages);
      return messages;
    } catch (error) {
      throw new Error(
        `Error while decoding ${this.getDisplayPath(locale)}:\n> ${error}`,
        {cause: error}
      );
    }
  }

  public async write(
    messages: Array<ExtractorMessage>,
    context: {
      locale: Locale;
      sourceMessagesById: Map<string, ExtractorMessage>;
    }
  ): Promise<boolean> {
    const filePath = this.getFilePath(context.locale);
    warnAboutMissingReferences(messages, this.warn);
    const content = this.codec.encode(messages, context);

    // Skip unchanged catalogs to avoid needless file system writes, which
    // would otherwise trigger watchers and bundler recompilation
    const currentContent = await fs
      .readFile(filePath, 'utf8')
      .catch(() => undefined);
    if (currentContent === content) return false;

    // Write to a temporary file first and move it into place, so that
    // concurrent readers (e.g. a build compiling catalogs) never observe a
    // truncated file. Not ending with the catalog extension, so that the
    // temporary file isn't mistaken for a locale.
    const tempPath = `${filePath}.${process.pid}.${randomUUID()}.tmp`;
    try {
      const outputDir = fsPath.dirname(filePath);
      await fs.mkdir(outputDir, {recursive: true});
      await fs.writeFile(tempPath, content);
      await fs.rename(tempPath, filePath);
      return true;
    } catch (error) {
      await fs.rm(tempPath, {force: true}).catch(() => {});
      console.error(`❌ Failed to write catalog: ${error}`);
      return false;
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
}

// The codecs read arrays fine (numeric path segments), but the runtime only
// supports strings — enforced here where the runtime's rules apply.
function assertNoArrayMessages(messages: Array<ExtractorMessage>): void {
  for (const message of messages) {
    const segments = message.segments;
    if (!Array.isArray(segments)) continue;
    const firstIndex = segments.findIndex(
      (segment) => typeof segment === 'number'
    );
    if (firstIndex === -1) continue;
    const arrayPath = segments.slice(0, firstIndex).join('.');
    throw new Error(
      `Message at \`${arrayPath}\` resolved to an array, but only strings are supported. See https://next-intl.dev/docs/usage/translations#arrays-of-messages`
    );
  }
}
