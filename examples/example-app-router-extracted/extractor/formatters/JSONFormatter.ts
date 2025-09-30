import {promises as fs} from 'fs';
import path from 'path';
import {set} from 'lodash-es';
import type {ExtractedMessage, Locale} from '../types.ts';
import type Formatter from './Formatter.ts';

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
    const filePath = path.join(
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
    const filePath = path.join(this.messagesPath, locale + this.EXTENSION);
    try {
      const outputDir = path.dirname(filePath);
      await fs.mkdir(outputDir, {recursive: true});
      const json = this.encode(messages);
      await fs.writeFile(filePath, JSON.stringify(json, null, 2));
    } catch (error) {
      console.error(`❌ Failed to write catalog: ${error}`);
    }
  }

  private encode(messages: Array<ExtractedMessage>): StoredFormat {
    const root: StoredFormat = {};
    for (const message of messages) {
      set(root, message.id, message.message);
    }
    return root;
  }

  private decode(json: StoredFormat): Array<ExtractedMessage> {
    const messages: Array<ExtractedMessage> = [];

    this.traverseMessages(json, (message, path) => {
      messages.push({id: path, message});
    });

    return messages;
  }

  private traverseMessages(
    obj: StoredFormat,
    callback: (value: string, path: string) => void,
    path: string = ''
  ): void {
    for (const key in obj) {
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
}
