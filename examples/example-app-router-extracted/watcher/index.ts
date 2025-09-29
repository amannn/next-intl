import SourceFileWatcher from './source/SourceFileWatcher.ts';
import CatalogManager, {type ExtractorConfig} from './CatalogManager.ts';

const config: ExtractorConfig = {
  sourceLocale: 'en',
  messagesPath: './messages',
  srcPath: './src',
  formatter: 'json'
};

export async function extractAll() {
  const manager = new CatalogManager(config);
  await manager.loadMessages();
  const count = await manager.save();
  console.log(`💾 Saved ${count} messages`);
}

export async function startWatcher() {
  const manager = new CatalogManager(config);
  await manager.loadMessages();
  await manager.save();

  const watcher = new SourceFileWatcher(manager);
  watcher.start();
  return watcher;
}

export async function startNextJsWatcher() {
  function runOnce(fn: () => void) {
    if (process.env._NEXT_INTL_EXTRACT_WATCHER === '1') {
      return;
    }
    process.env._NEXT_INTL_EXTRACT_WATCHER = '1';
    fn();
  }
  runOnce(() => {
    startWatcher();
  });
}
