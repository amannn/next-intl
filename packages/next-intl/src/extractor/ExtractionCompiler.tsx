import CatalogManager from './catalog/CatalogManager.js';
import type MessageExtractor from './extractor/MessageExtractor.js';
import type {ExtractorConfig} from './types.js';

export default class ExtractionCompiler implements Disposable {
  private manager: CatalogManager;

  constructor(
    config: ExtractorConfig,
    opts: {
      isDevelopment?: boolean;
      projectRoot?: string;
      sourceMap?: boolean;
      messageExtractor: MessageExtractor;
    }
  ) {
    this.manager = new CatalogManager(config, opts);
    this.installExitHandlers();
  }

  // This was part of #compile fn previously (remove this comment after updating tests)
  public async extractAll() {
    // We can't rely on all files being compiled (e.g. due to persistent
    // caching), so loading the messages initially is necessary.
    await this.manager.loadMessages();
    await this.manager.save();
  }

  [Symbol.dispose](): void {
    this.manager.destroy();
  }

  private installExitHandlers() {
    const cleanup = () => {
      try {
        this[Symbol.dispose]();
      } catch {
        // swallow cleanup errors
      }
    };

    process.once('exit', cleanup);
    process.once('SIGINT', () => {
      cleanup();
      process.exit(0);
    });
    process.once('SIGTERM', () => {
      cleanup();
      process.exit(0);
    });
  }
}
