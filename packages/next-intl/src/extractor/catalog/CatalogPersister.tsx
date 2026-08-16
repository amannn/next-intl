import fs from 'fs/promises';
import fsPath from 'path';
import type ExtractorCodec from '../format/ExtractorCodec.js';
import type {CatalogSplit, ExtractorMessage, Locale} from '../types.js';
import {getCatalogNamespace} from '../utils.js';

export default class CatalogPersister {
  private messagesPath: string;
  private codec: ExtractorCodec;
  private extension: string;
  private split?: CatalogSplit;

  public constructor(params: {
    messagesPath: string;
    codec: ExtractorCodec;
    extension: string;
    split?: CatalogSplit;
  }) {
    this.messagesPath = params.messagesPath;
    this.codec = params.codec;
    this.extension = params.extension;
    this.split = params.split;
  }

  private getFileName(locale: Locale): string {
    return locale + this.extension;
  }

  private getCatalogDir(): string {
    return fsPath.dirname(this.getRootFilePath('placeholder'));
  }

  private getRootFilePath(locale: Locale): string {
    return fsPath.join(this.messagesPath, this.getFileName(locale));
  }

  private getNamespaceFilePath(namespace: string, locale: Locale): string {
    return fsPath.join(
      this.getCatalogDir(),
      namespace,
      this.getFileName(locale)
    );
  }

  private displayName(filePath: string): string {
    return fsPath.relative(this.getCatalogDir(), filePath) || filePath;
  }

  private async listNamespaceDirs(): Promise<Array<string>> {
    try {
      const entries = await fs.readdir(this.getCatalogDir(), {
        withFileTypes: true
      });
      return entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);
    } catch {
      return [];
    }
  }

  private async readFile(
    filePath: string,
    locale: Locale
  ): Promise<Array<ExtractorMessage>> {
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
        `Error while reading ${this.displayName(filePath)}:\n> ${error}`,
        {cause: error}
      );
    }
    try {
      return this.codec.decode(content, {locale});
    } catch (error) {
      throw new Error(
        `Error while decoding ${this.displayName(filePath)}:\n> ${error}`,
        {cause: error}
      );
    }
  }

  public async read(locale: Locale): Promise<Array<ExtractorMessage>> {
    if (this.split !== 'namespace') {
      return this.readFile(this.getRootFilePath(locale), locale);
    }

    const byId = new Map<string, ExtractorMessage>();
    const rootMessages = await this.readFile(
      this.getRootFilePath(locale),
      locale
    );
    for (const message of rootMessages) {
      byId.set(message.id, message);
    }

    const dirs = await this.listNamespaceDirs();
    for (const dir of dirs) {
      const messages = await this.readFile(
        this.getNamespaceFilePath(dir, locale),
        locale
      );
      for (const message of messages) {
        byId.set(message.id, message);
      }
    }

    return Array.from(byId.values());
  }

  private async writeFile(
    filePath: string,
    messages: Array<ExtractorMessage>,
    context: {
      locale: Locale;
      sourceMessagesById: Map<string, ExtractorMessage>;
    }
  ): Promise<void> {
    const content = this.codec.encode(messages, context);

    try {
      await fs.mkdir(fsPath.dirname(filePath), {recursive: true});
      await fs.writeFile(filePath, content);
    } catch (error) {
      console.error(`❌ Failed to write catalog: ${error}`);
    }
  }

  private async removeFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'ENOENT'
      ) {
        return;
      }
      console.error(`❌ Failed to remove catalog: ${error}`);
    }
  }

  private async removeDirIfEmpty(dirPath: string): Promise<void> {
    try {
      const entries = await fs.readdir(dirPath);
      if (entries.length > 0) {
        return;
      }
      await fs.rmdir(dirPath);
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'ENOENT'
      ) {
        return;
      }
      console.error(`❌ Failed to remove catalog directory: ${error}`);
    }
  }

  public async write(
    messages: Array<ExtractorMessage>,
    context: {
      locale: Locale;
      sourceMessagesById: Map<string, ExtractorMessage>;
    }
  ): Promise<void> {
    if (this.split !== 'namespace') {
      await this.writeFile(
        this.getRootFilePath(context.locale),
        messages,
        context
      );
      return;
    }

    const rootMessages: Array<ExtractorMessage> = [];
    const messagesByNamespace = new Map<string, Array<ExtractorMessage>>();

    for (const message of messages) {
      const namespace = getCatalogNamespace(message.id);
      if (namespace == null) {
        rootMessages.push(message);
        continue;
      }

      const namespaceMessages = messagesByNamespace.get(namespace);
      if (namespaceMessages) {
        namespaceMessages.push(message);
      } else {
        messagesByNamespace.set(namespace, [message]);
      }
    }

    await this.writeFile(
      this.getRootFilePath(context.locale),
      rootMessages,
      context
    );

    for (const [namespace, namespaceMessages] of messagesByNamespace) {
      await this.writeFile(
        this.getNamespaceFilePath(namespace, context.locale),
        namespaceMessages,
        context
      );
    }

    const dirs = await this.listNamespaceDirs();
    for (const dir of dirs) {
      if (messagesByNamespace.has(dir)) {
        continue;
      }
      await this.removeFile(this.getNamespaceFilePath(dir, context.locale));
      await this.removeDirIfEmpty(fsPath.join(this.getCatalogDir(), dir));
    }
  }

  public async getLastModified(locale: Locale): Promise<Date | undefined> {
    const filePaths = [this.getRootFilePath(locale)];
    if (this.split === 'namespace') {
      const dirs = await this.listNamespaceDirs();
      for (const dir of dirs) {
        filePaths.push(this.getNamespaceFilePath(dir, locale));
      }
    }

    let latest: Date | undefined;
    for (const filePath of filePaths) {
      try {
        const stats = await fs.stat(filePath);
        if (!latest || stats.mtime > latest) {
          latest = stats.mtime;
        }
      } catch {
        // File may not exist yet
      }
    }
    return latest;
  }
}
