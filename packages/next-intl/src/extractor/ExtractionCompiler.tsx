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
    this.manager = new CatalogManager(config, {
      ...opts,
      extractor
    });
    this[Symbol.dispose] = this[Symbol.dispose].bind(this);
    this.installExitHandlers();
  }

  public async extractAll(): Promise<{
    filesScanned: number;
    filesChanged: number;
  }> {
    const stats = await this.manager.loadMessages();
    await this.manager.save();
    return stats;
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
