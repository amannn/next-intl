import {promises as fs} from 'fs';
import path from 'path';
import type {ExtractedMessage} from '../types.ts';
import type Formatter from './Formatter.ts';

type JsonOnDisk = Record<string, unknown>;

// Note: We don't read here, because the JSON format can't restore
// metadata like the file path, which is needed for the watcher
// to detect changed messages.

export default class JSONFormatter implements Formatter {
  private filePath: string;

  constructor(messagesPath: string, sourceLocale: string) {
    this.filePath = path.join(messagesPath, `${sourceLocale}.json`);
  }

  async write(messages: Array<ExtractedMessage>): Promise<void> {
    try {
      const outputDir = path.dirname(this.filePath);
      await fs.mkdir(outputDir, {recursive: true});
      const json = this.messagesToJson(messages);
      await fs.writeFile(this.filePath, JSON.stringify(json, null, 2));
    } catch (error) {
      console.error(`❌ Failed to write catalog: ${error}`);
    }
  }

  private messagesToJson(messages: Array<ExtractedMessage>): JsonOnDisk {
    const root: JsonOnDisk = {};
    for (const message of messages) {
      const segments = (
        message.namespace ? message.namespace.split('.') : []
      ).filter(Boolean);
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
