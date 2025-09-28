import fs from 'fs';
import path from 'path';
import chokidar, {FSWatcher} from 'chokidar';
import {CatalogManager} from './CatalogManager.ts';
import SourceFileAnalyzer from './SourceFileAnalyzer.ts';

export default class SourceFileWatcher {
  private watcher: FSWatcher | null = null;
  private srcPath: string;
  private manager: CatalogManager;
  private persistent: boolean;

  constructor(srcPath: string, manager: CatalogManager, persistent: boolean) {
    this.srcPath = srcPath;
    this.manager = manager;
    this.persistent = persistent;
  }

  start() {
    if (!fs.existsSync(this.srcPath)) {
      console.log(`❌ Directory does not exist: ${this.srcPath}`);
      return;
    }

    this.watcher = chokidar.watch(this.srcPath, {
      ignored(file) {
        return file.includes('node_modules');
      },
      persistent: this.persistent,
      ignoreInitial: true, // Don't trigger events for existing files
      cwd: this.srcPath
    });

    this.watcher.on('change', (filePath: string) => {
      this.onFileChange('change', filePath);
    });
    this.watcher.on('add', (filePath: string) => {
      this.onFileChange('rename', filePath);
    });
    this.watcher.on('unlink', (filePath: string) => {
      this.onFileChange('rename', filePath);
    });
    this.watcher.on('error', (error: unknown) => {
      console.error(`❌ Watcher error: ${error}`);
    });
  }

  stop() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }

  private async onFileChange(
    eventType: 'rename' | 'change',
    relativePath: string
  ) {
    if (!SourceFileAnalyzer.isSourceFile(relativePath)) {
      return;
    }

    let now = performance.now(),
      extractDuration = 0,
      saveDuration = 0;
    console.log(`📝 File ${eventType}: ${relativePath}`);

    const fullPath = path.join(this.srcPath, relativePath);
    const numExtracted = await this.manager.extractFileMessages(fullPath);
    extractDuration = performance.now() - now;
    console.log(`   Extracted ${numExtracted} message(s)`);

    if (numExtracted > 0) {
      now = performance.now();
      // TODO: Debounce
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

    // TODO: Async schedule another scan if the extracted messages were also
    // used in another file to check if they are still used.
  }
}
