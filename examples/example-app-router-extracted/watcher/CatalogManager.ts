import type {
  ExtractedMessage,
  ExtractionConfig,
  MessageFormatter
} from './types.ts';

type ChangeSummary = {
  addedCount: number;
  updatedCount: number;
  removedCount: number;
  totalCount: number;
};

export class CatalogManager {
  private config: ExtractionConfig;
  private formatter: MessageFormatter;
  private messages: Array<ExtractedMessage> = [];
  private initialMessages: Array<ExtractedMessage> = [];

  constructor(
    config: ExtractionConfig,
    formatter: MessageFormatter,
    initialMessages: Array<ExtractedMessage> = []
  ) {
    this.config = config;
    this.formatter = formatter;
    this.messages = [...initialMessages];
    this.initialMessages = initialMessages;
  }

  async addMessages(messages: Array<ExtractedMessage>): Promise<ChangeSummary> {
    let addedCount = 0;
    let updatedCount = 0;
    for (const message of messages) {
      const existingIndex = this.messages.findIndex(
        (existing) =>
          existing.namespace === (message.namespace || 'default') &&
          existing.id === message.id
      );
      if (existingIndex === -1) {
        this.messages.push(message);
        addedCount += 1;
      } else if (this.messages[existingIndex].message !== message.message) {
        this.messages[existingIndex] = message;
        updatedCount += 1;
      }
    }

    console.log(messages);

    if (addedCount > 0 || updatedCount > 0) {
      await this.save();
    }

    return {
      addedCount,
      updatedCount,
      removedCount: 0,
      totalCount: this.messages.length
    };
  }

  /**
   * Remove messages that are no longer used
   */
  async removeMessages(
    messages: Array<ExtractedMessage>
  ): Promise<ChangeSummary> {
    const set = new Set(
      messages.map((m) => `${m.namespace || 'default'}:${m.id}`)
    );
    const before = this.messages.length;
    this.messages = this.messages.filter(
      (m) => !set.has(`${m.namespace || 'default'}:${m.id}`)
    );
    const removedCount = before - this.messages.length;
    if (removedCount > 0) {
      await this.save();
    }
    return {
      addedCount: 0,
      updatedCount: 0,
      removedCount,
      totalCount: this.messages.length
    };
  }

  /**
   * Get current catalog
   */
  getMessages(): Array<ExtractedMessage> {
    return this.messages;
  }

  /**
   * Save catalog to disk
   */
  private async save(): Promise<void> {
    await this.formatter.write(this.messages);
  }

  formatSummary(prefix: string, summary: ChangeSummary): string {
    return `${prefix} ➕ ${summary.addedCount} ➖ ${summary.removedCount} ✏️ ${summary.updatedCount} (total ${summary.totalCount})`;
  }

  /**
   * Get statistics about the catalog
   */
  getStats(): {totalMessages: number; namespaces: Array<string>} {
    const namespaces = Array.from(
      new Set(this.messages.map((m) => m.namespace || 'default'))
    );
    const totalMessages = this.messages.length;
    return {totalMessages, namespaces};
  }

  getInitialVsCurrentDelta(): {
    added: number;
    removed: number;
    updated: number;
  } {
    const toKey = (m: ExtractedMessage) => `${m.namespace || ''}:::${m.id}`;
    const initialMap = new Map(
      this.initialMessages.map((m) => [toKey(m), m.message])
    );
    const currentMap = new Map(this.messages.map((m) => [toKey(m), m.message]));
    let added = 0;
    let removed = 0;
    let updated = 0;
    for (const key of currentMap.keys()) {
      if (!initialMap.has(key)) added++;
      else if (initialMap.get(key) !== currentMap.get(key)) updated++;
    }
    for (const key of initialMap.keys()) {
      if (!currentMap.has(key)) removed++;
    }
    return {added, removed, updated};
  }
}
