import SourceFileWatcher from './source/SourceFileWatcher.ts';
import {CatalogManager} from './CatalogManager.ts';
import ExtractorConfig, {type ExtractorConfigInput} from './ExtractorConfig.ts';

const config: ExtractorConfigInput = {
  sourceLocale: 'en',
  messagesPath: './messages',
  srcPath: './src',
  formatter: 'json'
};

const {srcPath, formatter} = await ExtractorConfig.loadConfig(config);

export async function extractAll() {
  const manager = new CatalogManager(formatter, srcPath);
  await manager.initFromSource();
  const count = await manager.save();
  console.log(`💾 Saved ${count} messages`);
}

export async function startWatcher() {
  const manager = new CatalogManager(formatter, srcPath);

  // TODO: We could potentially skip this in favor of reading
  // the existing messages for the .po format since it provides
  // all the necessary context by itself
  await manager.initFromSource();
  await manager.save();

  const watcher = new SourceFileWatcher(srcPath, manager);
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
