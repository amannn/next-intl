import fs from 'fs';
import path from 'path';
import chokidar, {FSWatcher} from 'chokidar';
import type {ExtractionConfig} from './types.ts';
import {MessageExtractor} from './MessageExtractor.ts';
import {CatalogManager} from './CatalogManager.ts';

export default class FileWatcher {
  private watcher: FSWatcher | null = null;
  private srcPath: string;
  private messageExtractor: MessageExtractor;
  private catalogManager: CatalogManager;
  private config: ExtractionConfig;

  constructor(
    srcPath: string,
    config: ExtractionConfig,
    extractor: MessageExtractor,
    manager: CatalogManager
  ) {
    this.srcPath = srcPath;
    this.config = config;
    this.messageExtractor = extractor;
    this.catalogManager = manager;
  }

  start() {
    if (!fs.existsSync(this.srcPath)) {
      console.log(`❌ Directory does not exist: ${this.srcPath}`);
      return;
    }

    // Create chokidar watcher with glob patterns for source files
    this.watcher = chokidar.watch(this.srcPath, {
      ignored(file) {
        return file.includes('node_modules');
      },
      persistent: true, // change later
      ignoreInitial: true, // Don't trigger events for existing files
      cwd: this.srcPath
    });

    // Watch for changes
    this.watcher.on('change', (filePath: string) => {
      this.handleFileChange('change', filePath);
    });

    // Watch for file additions/removals
    this.watcher.on('add', (filePath: string) => {
      this.handleFileChange('rename', filePath);
    });

    this.watcher.on('unlink', (filePath: string) => {
      this.handleFileChange('rename', filePath);
    });

    this.watcher.on('error', (error: unknown) => {
      console.error(`❌ Watcher error: ${error}`);
    });
  }

  private handleFileChange(eventType: 'rename' | 'change', filePath: string) {
    // filePath is already relative to the watched directory (cwd)
    const relativePath = filePath;

    if (!this.isSourceFile(filePath)) {
      return;
    }

    console.log(`📝 File ${eventType}: ${relativePath}`);

    // Extract messages from the changed file
    void this.extractMessagesFromFile(relativePath);
  }

  /**
   * Extract messages from a file and update the catalog
   */
  private async extractMessagesFromFile(relativePath: string) {
    try {
      const fullPath = path.join(this.srcPath, relativePath);
      const messages = await this.messageExtractor.extractFromFile(fullPath);
      if (messages.length > 0) {
        const summary = await this.catalogManager.addMessages(messages);
        console.log(
          this.catalogManager.formatSummary(`🔍 ${relativePath}`, summary)
        );
      }
    } catch (error) {
      console.error(
        `❌ Failed to extract messages from ${relativePath}: ${error}`
      );
    }
  }

  private isSourceFile(filename: string): boolean {
    const ext = path.extname(filename);
    return [
      '.ts',
      '.tsx',
      '.js',
      '.jsx',
      '.mjs',
      '.cjs',
      '.mts',
      '.cts',
      '.cjs'
    ].includes(ext);
  }

  stop() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }

    // Print final statistics and initial-vs-current delta
    const stats = this.catalogManager.getStats();
    console.log(
      `📊 Final catalog stats: ${stats.totalMessages} messages across ${stats.namespaces.length} namespaces`
    );
    const delta = this.catalogManager.getInitialVsCurrentDelta();
    console.log(
      `🧮 Delta since start: ➕ ${delta.added} ➖ ${delta.removed} ✏️ ${delta.updated}`
    );
  }
}
