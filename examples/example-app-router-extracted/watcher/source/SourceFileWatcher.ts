import fs from 'fs';
import path from 'path';
import {
  type AsyncSubscription,
  type Event as WatchEvent,
  subscribe
} from '@parcel/watcher';
import CatalogManager from '../CatalogManager.ts';
import SourceFileAnalyzer from './SourceFileAnalyzer.ts';

export default class SourceFileWatcher {
  private watcher: AsyncSubscription | null = null;
  private manager: CatalogManager;

  constructor(manager: CatalogManager) {
    this.manager = manager;
  }

  private getSrcPath() {
    return this.manager.getSrcPath();
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
      totalExtracted = 0;

    for (const event of events) {
      if (
        event.type === 'delete' ||
        !SourceFileAnalyzer.isSourceFile(event.path)
      ) {
        return;
      }

      console.log(`📝 File ${event.type}: ${event.path.split(path.sep).pop()}`);
      const numExtracted = await this.manager.extractFileMessages(event.path);
      console.log(`   Extracted ${numExtracted} message(s)`);
      totalExtracted += numExtracted;
    }
    const extractDuration = performance.now() - now;

    if (totalExtracted > 0) {
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
