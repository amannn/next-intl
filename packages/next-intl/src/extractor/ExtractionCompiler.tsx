import CatalogManager from './catalog/CatalogManager.js';
import MessageExtractor from './extractor/MessageExtractor.js';
import type {ExtractorConfig} from './types.js';

export default class ExtractionCompiler implements Disposable {
  private manager: CatalogManager;

  public constructor(
    config: ExtractorConfig,
    opts: {
      isDevelopment?: boolean;
      projectRoot?: string;
      sourceMap?: boolean;
      extractor?: MessageExtractor;
    } = {}
  ) {
    const extractor = opts.extractor ?? new MessageExtractor(opts);
    this.manager = new CatalogManager(config, {...opts, extractor});
    this[Symbol.dispose] = this[Symbol.dispose].bind(this);
    this.installExitHandlers();
  }

  public async extractAll() {
    // We can't rely on all files being compiled (e.g. due to persistent
    // caching), so loading the messages initially is necessary.
    await this.manager.loadMessages();
    await this.manager.save();
  }

  public [Symbol.dispose](): void {
    this.uninstallExitHandlers();
    this.manager[Symbol.dispose]();
  }

  private installExitHandlers() {
    const cleanup = this[Symbol.dispose];
    process.on('exit', cleanup);
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  }

  private uninstallExitHandlers() {
    const cleanup = this[Symbol.dispose];
    process.off('exit', cleanup);
    process.off('SIGINT', cleanup);
    process.off('SIGTERM', cleanup);
  }
}
