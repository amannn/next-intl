import fs from 'fs/promises';
import fsPath from 'path';
import type ExtractorCodec from '../format/ExtractorCodec.js';
import type {ExtractorMessage, Locale} from '../types.js';
import type Logger from '../utils/Logger.js';

export default class CatalogPersister {
  private messagesPath: string;
  private codec: ExtractorCodec;
  private extension: string;
  private logger?: Logger;

  public constructor(params: {
    messagesPath: string;
    codec: ExtractorCodec;
    extension: string;
    logger?: Logger;
  }) {
    this.messagesPath = params.messagesPath;
    this.codec = params.codec;
    this.extension = params.extension;
    this.logger = params.logger;
  }

  private getFileName(locale: Locale): string {
    return locale + this.extension;
  }

  private getFilePath(locale: Locale): string {
    return fsPath.join(this.messagesPath, this.getFileName(locale));
  }

  public async read(locale: Locale): Promise<Array<ExtractorMessage>> {
    void this.logger?.debug('CatalogPersister.read() called', {locale});
    const filePath = this.getFilePath(locale);
    let content: string;
    try {
      const readStart = Date.now();
      content = await fs.readFile(filePath, 'utf8');
      const readDuration = Date.now() - readStart;
      void this.logger?.debug('CatalogPersister.read() - file read', {
        locale,
        filePath,
        contentLength: content.length,
        readDurationMs: readDuration
      });
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'ENOENT'
      ) {
        void this.logger?.debug(
          'CatalogPersister.read() - file not found (ENOENT)',
          {
            locale,
            filePath
          }
        );
        return [];
      }
      void this.logger?.error('CatalogPersister.read() - read error', {
        locale,
        filePath,
        error: String(error)
      });
      throw new Error(
        `Error while reading ${this.getFileName(locale)}:\n> ${error}`,
        {cause: error}
      );
    }
    try {
      const decodeStart = Date.now();
      const messages = this.codec.decode(content, {locale});
      const decodeDuration = Date.now() - decodeStart;
      void this.logger?.debug('CatalogPersister.read() - decode completed', {
        locale,
        messageCount: messages.length,
        decodeDurationMs: decodeDuration
      });
      return messages;
    } catch (error) {
      void this.logger?.error('CatalogPersister.read() - decode error', {
        locale,
        filePath,
        error: String(error)
      });
      throw new Error(
        `Error while decoding ${this.getFileName(locale)}:\n> ${error}`,
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
  ): Promise<void> {
    const emptyMessageCount = messages.filter((m) => !m.message).length;
    void this.logger?.info('CatalogPersister.write() called', {
      locale: context.locale,
      messageCount: messages.length,
      emptyMessageCount
    });

    // Critical error detection: all messages are empty strings (wipeout bug)
    if (messages.length > 0 && emptyMessageCount === messages.length) {
      const sourceMessageCount = context.sourceMessagesById.size;
      const sampleMessageIds = messages.map((m) => m.id).slice(0, 20);
      const sampleSourceMessages = Array.from(
        context.sourceMessagesById.values()
      )
        .slice(0, 5)
        .map((m) => ({id: m.id, hasMessage: !!m.message}));

      void this.logger?.error(
        '🚨 CRITICAL: All messages in locale catalog are empty strings (wipeout detected)',
        {
          locale: context.locale,
          messageCount: messages.length,
          emptyMessageCount,
          sourceMessageCount,
          sampleMessageIds,
          sampleSourceMessages,
          hasSourceMessages: sourceMessageCount > 0,
          stackTrace: new Error().stack
        }
      );
    }

    const startTime = Date.now();
    const filePath = this.getFilePath(context.locale);

    const encodeStart = Date.now();
    const content = this.codec.encode(messages, context);
    const encodeDuration = Date.now() - encodeStart;
    void this.logger?.debug('CatalogPersister.write() - encode completed', {
      locale: context.locale,
      contentLength: content.length,
      encodeDurationMs: encodeDuration
    });

    try {
      const outputDir = fsPath.dirname(filePath);
      await fs.mkdir(outputDir, {recursive: true});
      const writeStart = Date.now();
      await fs.writeFile(filePath, content);
      const writeDuration = Date.now() - writeStart;
      const totalDuration = Date.now() - startTime;
      void this.logger?.info('CatalogPersister.write() - write completed', {
        locale: context.locale,
        filePath,
        messageCount: messages.length,
        emptyMessageCount: messages.filter((m) => !m.message).length,
        writeDurationMs: writeDuration,
        totalDurationMs: totalDuration
      });
    } catch (error) {
      void this.logger?.error('CatalogPersister.write() - write failed', {
        locale: context.locale,
        filePath,
        error: String(error),
        messageCount: messages.length
      });
      console.error(`❌ Failed to write catalog: ${error}`);
    }
  }

  public async getLastModified(locale: Locale): Promise<Date | undefined> {
    const filePath = this.getFilePath(locale);
    try {
      const stats = await fs.stat(filePath);
      void this.logger?.debug('CatalogPersister.getLastModified()', {
        locale,
        filePath,
        mtime: stats.mtime.toISOString()
      });
      return stats.mtime;
    } catch {
      void this.logger?.debug(
        'CatalogPersister.getLastModified() - file not found',
        {
          locale,
          filePath
        }
      );
      return undefined;
    }
  }
}
