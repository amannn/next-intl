import type {ExtractedMessage} from '../types.js';
import Formatter from './Formatter.js';

interface StoredFormat {
  [key: string]: string | StoredFormat;
}

export default class JSONFormatter extends Formatter {
  static readonly NAMESPACE_SEPARATOR = '.';

  public readonly EXTENSION = '.json';

  public parse(content: string): Array<ExtractedMessage> {
    const json: StoredFormat = JSON.parse(content);
    const messages: Array<ExtractedMessage> = [];

    this.traverseMessages(json, (message, id) => {
      messages.push({id, message});
    });

    return messages;
  }

  public serialize(messages: Array<ExtractedMessage>): string {
    // Sort messages by id for consistent output
    const sortedMessages = [...messages].sort((a, b) =>
      a.id.localeCompare(b.id)
    );

    const root: StoredFormat = {};
    for (const message of sortedMessages) {
      this.setNestedProperty(root, message.id, message.message);
    }
    return JSON.stringify(root, null, 2);
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
