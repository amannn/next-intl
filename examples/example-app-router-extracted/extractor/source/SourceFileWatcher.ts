import fs from 'fs';
import path from 'path';
import {
  type AsyncSubscription,
  type Event as WatchEvent,
  subscribe
} from '@parcel/watcher';
import CatalogManager from '../catalog/CatalogManager.ts';
import SourceFileAnalyzer from './SourceFileAnalyzer.ts';
import type {ExtractedMessage} from '../types.ts';

export default class SourceFileWatcher {
  private watcher: AsyncSubscription | null = null;
  private manager: CatalogManager;

  constructor(manager: CatalogManager) {
    this.manager = manager;
  }

  private getSrcPath() {
    return this.manager.getSrcPath();
  }

  private hasMessagesChanged(
    messages1: Map<string, ExtractedMessage> | undefined,
    messages2: Map<string, ExtractedMessage> | undefined
  ): boolean {
    // If one exists and the other doesn't, there's a change
    if (!messages1 || !messages2) {
      return messages1 !== messages2;
    }

    // Different sizes means changes
    if (messages1.size !== messages2.size) {
      return true;
    }

    // Check differences in messages1 vs messages2
    for (const [id, msg1] of messages1) {
      const msg2 = messages2.get(id);
      if (!msg2 || msg1.message !== msg2.message) {
        return true; // Early exit on first difference
      }
    }

    return false;
  }

  start() {
    if (!fs.existsSync(this.getSrcPath())) {
      console.log(`❌ Directory does not exist: ${this.getSrcPath()}`);
      return;
    }

    subscribe(this.getSrcPath(), this.onFileChanges.bind(this), {
      ignore: ['**/node_modules/**']
    })
      .then((subscription) => {
        this.watcher = subscription;
      })
      .catch((err) => {
        console.error(`❌ Failed to start watcher: ${err}`);
      });
  }

  private async onFileChanges(error: Error | null, events: Array<WatchEvent>) {
    if (error) {
      console.error(`❌ Watcher subscription error: ${error}`);
      return;
    }
    let now = performance.now(),
      saveDuration = 0,
      hasChanges = false;

    for (const event of events) {
      if (
        event.type === 'delete' ||
        !SourceFileAnalyzer.isSourceFile(event.path)
      ) {
        return;
      }

      console.log(`📝 File ${event.type}: ${event.path.split(path.sep).pop()}`);

      // Get messages before extraction
      const beforeMessages = this.manager.getFileMessages(event.path);

      // Extract messages
      const result = await this.manager.extractFileMessages(
        event.path,
        fs.readFileSync(event.path, 'utf8'),
        'extract'
      );
      console.log(`   Extracted ${result.messages.length} message(s)`);

      // Get messages after extraction
      const afterMessages = this.manager.getFileMessages(event.path);

      // Check if messages changed
      const changed = this.hasMessagesChanged(beforeMessages, afterMessages);

      if (changed) {
        console.log(`   Messages changed`);
        hasChanges = true;
      }
    }
    const extractDuration = performance.now() - now;

    if (hasChanges) {
      now = performance.now();
      const count = await this.manager.save();
      console.log(`   Saved ${count} messages`);
      saveDuration = performance.now() - now;
    }

    if (saveDuration > 0) {
      console.log(
        `   Duration: ${extractDuration.toFixed(2)}ms (extract), ${saveDuration.toFixed(2)}ms (save) = ${(extractDuration + saveDuration).toFixed(2)}ms`
      );
    } else {
      console.log(`   Duration: ${extractDuration.toFixed(2)}ms (extract)`);
    }
  }

  stop() {
    if (this.watcher) {
      this.watcher.unsubscribe().finally(() => {
        this.watcher = null;
      });
    }
  }
}
