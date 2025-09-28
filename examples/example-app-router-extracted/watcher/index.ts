import path from 'path';
import {fileURLToPath} from 'url';
import SourceFileWatcher from './SourceFileWatcher.ts';
import type {ExtractionConfig} from './types.ts';
import {CatalogManager} from './CatalogManager.ts';
import {JSONFormatter} from './JSONFormatter.ts';

const config: ExtractionConfig = {
  sourceLocale: 'en',
  messagesPath: './messages',
  srcPath: './src'
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const srcPath = path.join(projectRoot, config.srcPath);
const messagesDir = path.join(projectRoot, config.messagesPath);

// TODO: Make configurable
const formatter = new JSONFormatter(messagesDir, config.sourceLocale);

export async function extractAll() {
  const manager = new CatalogManager(formatter, srcPath);
  await manager.initFromSource();
  const count = await manager.save();
  console.log(`💾 Saved ${count} messages`);
}

export async function startWatcher(persistent = false) {
  const manager = new CatalogManager(formatter, srcPath);

  // TODO: We could potentially skip this in favor of reading
  // the existing messages for the .po format since it provides
  // all the necessary context by itself
  await manager.initFromSource();
  await manager.save();

  const watcher = new SourceFileWatcher(srcPath, manager, persistent);
  watcher.start();
  return watcher;
}
