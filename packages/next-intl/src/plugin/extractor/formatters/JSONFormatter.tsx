import type {ExtractedMessage, Locale} from '../types.js';
import BaseFormatter from './BaseFormatter.js';

interface StoredFormat {
  [key: string]: string | StoredFormat;
}

export default class JSONFormatter extends BaseFormatter {
  static readonly NAMESPACE_SEPARATOR = '.';

  public readonly EXTENSION = '.json';

  /**
   * Note: This is not safe for hydrating messages for the source locale, as
   * JSON doesn't store metadata like the file path which is required for
   * detecting changes to existing messages.
   *
   * This can however be used for target locales.
   */
  public async read(targetLocale: Locale): Promise<Array<ExtractedMessage>> {
    const content = await this.readCatalogFile(targetLocale);
    return this.decode(content);
  }

  public async write(
    locale: Locale,
    messages: Array<ExtractedMessage>
  ): Promise<void> {
    // Sort messages by id for consistent output
    const sortedMessages = [...messages].sort((a, b) =>
      a.id.localeCompare(b.id)
    );

    const content = this.encode(sortedMessages);
    await this.writeCatalogFile(locale, content);
  }

  private encode(messages: Array<ExtractedMessage>): string {
    const root: StoredFormat = {};
    for (const message of messages) {
      this.setNestedProperty(root, message.id, message.message);
    }
    return JSON.stringify(root, null, 2);
  }

  private decode(content: string): Array<ExtractedMessage> {
    const json: StoredFormat = JSON.parse(content);
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
