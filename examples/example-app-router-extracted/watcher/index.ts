import path from 'path';
import {fileURLToPath} from 'url';
import FileWatcher from './FileWatcher.ts';
import type {ExtractionConfig} from './types.ts';
import {CatalogManager} from './CatalogManager.ts';
import {MessageExtractor} from './MessageExtractor.ts';
import {JSONFormatter} from './JSONFormatter.ts';
import FileAnalyzer from './FileAnalyzer.ts';

// Resolve project root relative to this file, not the cwd
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Paths
const srcPath = path.join(projectRoot, 'src');
const messagesDir = path.join(projectRoot, 'messages');

// TODO: How to map existing config?
const config: ExtractionConfig = {
  sourceLocale: 'en',
  messagesPath: './messages'
};

// Orchestration helpers
// 1) Full extraction (non-watcher) — can be called from here or another script later
async function extractAll() {
  const extractor = new MessageExtractor();
  const allMessages = await FileAnalyzer.loadMessages(srcPath, extractor);
  const manager = new CatalogManager(
    config,
    new JSONFormatter(messagesDir, config.sourceLocale),
    allMessages
  );
  const summary = await manager.addMessages(allMessages);
  console.log(manager.formatSummary('📦 Extract all', summary));
}
// CLI entrypoint
const args = process.argv.slice(2);
if (args.includes('--watch')) {
  const extractor = new MessageExtractor();
  const initialMessages = await FileAnalyzer.loadMessages(srcPath, extractor);
  console.log(`🔢 Loaded ${initialMessages.length} messages from source`);
  const formatter = new JSONFormatter(messagesDir, config.sourceLocale);
  formatter.write(initialMessages);
  const manager = new CatalogManager(config, formatter, initialMessages);
  const watcher = new FileWatcher(srcPath, config, extractor, manager);

  watcher.start();

  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    watcher.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    watcher.stop();
    process.exit(0);
  });
} else {
  await extractAll();
  process.exit(0);
}
