import fs from 'fs/promises';
import fsPath from 'path';
import type {ExtractedMessage, Locale} from '../types.js';
import type Formatter from './Formatter.js';

interface StoredFormat {
  [key: string]: string | StoredFormat;
}

// Note: We don't read here, because the JSON format can't restore
// metadata like the file path, which is needed for the watcher
// to detect changed messages.

export default class JSONFormatter implements Formatter {
  static readonly NAMESPACE_SEPARATOR = '.';

  public readonly EXTENSION = '.json';

  private messagesPath: string;

  constructor(messagesPath: string) {
    this.messagesPath = messagesPath;
  }

  /**
   * Note: This is not safe for hydrating messages for the source locale, as
   * JSON doesn't store metadata like the file path which is required for
   * detecting changes to existing messages.
   *
   * This can however be used for target locales.
   */
  async read(targetLocale: Locale): Promise<Array<ExtractedMessage>> {
    const filePath = fsPath.join(
      this.messagesPath,
      targetLocale + this.EXTENSION
    );
    const content = await fs.readFile(filePath, 'utf8');
    const json = JSON.parse(content);
    return this.decode(json);
  }

  async write(
    locale: Locale,
    messages: Array<ExtractedMessage>
  ): Promise<void> {
    const filePath = fsPath.join(this.messagesPath, locale + this.EXTENSION);
    try {
      const outputDir = fsPath.dirname(filePath);
      await fs.mkdir(outputDir, {recursive: true});

      // Sort messages by id for consistent output
      const sortedMessages = [...messages].sort((a, b) =>
        a.id.localeCompare(b.id)
      );

      const json = this.encode(sortedMessages);
      await fs.writeFile(filePath, JSON.stringify(json, null, 2));
    } catch (error) {
      console.error(`❌ Failed to write catalog: ${error}`);
    }
  }

  async getLastModified(locale: Locale): Promise<Date | undefined> {
    const filePath = fsPath.join(this.messagesPath, locale + this.EXTENSION);
    try {
      const stats = await fs.stat(filePath);
      return stats.mtime;
    } catch {
      return undefined;
    }
  }

  private encode(messages: Array<ExtractedMessage>): StoredFormat {
    const root: StoredFormat = {};
    for (const message of messages) {
      this.setNestedProperty(root, message.id, message.message);
    }
    return root;
  }

  private decode(json: StoredFormat): Array<ExtractedMessage> {
    const messages: Array<ExtractedMessage> = [];

    this.traverseMessages(json, (message, id) => {
      messages.push({id, message});
    });

    return messages;
  }

  private traverseMessages(
    obj: StoredFormat,
    callback: (value: string, path: string) => void,
    path = ''
  ): void {
    for (const key of Object.keys(obj)) {
      const newPath = path
        ? path + JSONFormatter.NAMESPACE_SEPARATOR + key
        : key;
      const value = obj[key];
      if (typeof value === 'string') {
        callback(value, newPath);
      } else if (typeof value === 'object') {
        this.traverseMessages(value, callback, newPath);
      }
    }
  }

  private setNestedProperty(
    obj: Record<string, any>,
    path: string,
    value: any
  ): void {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (
        !(key in current) ||
        typeof current[key] !== 'object' ||
        current[key] === null
      ) {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }
}
