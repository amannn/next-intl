import {promises as fs} from 'fs';
import path from 'path';
import type {ExtractedMessage} from '../types.ts';
import type Formatter from './Formatter.ts';

type StoredFormat = Record<string, unknown>;

// Note: We don't read here, because the JSON format can't restore
// metadata like the file path, which is needed for the watcher
// to detect changed messages.

export default class JSONFormatter implements Formatter {
  public readonly EXTENSION = '.json';

  private messagesPath: string;

  constructor(messagesPath: string) {
    this.messagesPath = messagesPath;
  }

  async write(
    locale: string,
    messages: Array<ExtractedMessage>
  ): Promise<void> {
    const filePath = path.join(this.messagesPath, locale + this.EXTENSION);
    try {
      const outputDir = path.dirname(filePath);
      await fs.mkdir(outputDir, {recursive: true});
      const json = this.serializeMessages(messages);
      await fs.writeFile(filePath, JSON.stringify(json, null, 2));
    } catch (error) {
      console.error(`❌ Failed to write catalog: ${error}`);
    }
  }

  private serializeMessages(messages: Array<ExtractedMessage>): StoredFormat {
    const root: StoredFormat = {};
    for (const message of messages) {
      const segments = message.namespace?.split('.') ?? [];
      let node: Record<string, unknown> = root;
      for (const segment of segments) {
        const current = node[segment];
        if (!current || typeof current !== 'object') {
          node[segment] = {};
        }
        node = node[segment] as Record<string, unknown>;
      }
      node[message.id] = message.message;
    }
    return root;
  }
}
