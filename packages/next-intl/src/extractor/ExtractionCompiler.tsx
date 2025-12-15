import CatalogManager from './catalog/CatalogManager.js';
import MessageExtractor from './extractor/MessageExtractor.js';
import type {ExtractorConfig} from './types.js';
import type Logger from './utils/Logger.js';

export default class ExtractionCompiler implements Disposable {
  private manager: CatalogManager;
  private logger?: Logger;

  public constructor(
    config: ExtractorConfig,
    opts: {
      isDevelopment?: boolean;
      projectRoot?: string;
      sourceMap?: boolean;
      extractor?: MessageExtractor;
      logger?: Logger;
    } = {}
  ) {
    this.logger = opts.logger;
    void this.logger?.info('ExtractionCompiler constructor called', {
      hasExtractor: !!opts.extractor,
      isDevelopment: opts.isDevelopment
    });
    const extractor = opts.extractor ?? new MessageExtractor(opts);
    this.manager = new CatalogManager(config, {
      ...opts,
      extractor,
      logger: this.logger
    });
    this[Symbol.dispose] = this[Symbol.dispose].bind(this);
    this.installExitHandlers();
  }

  public async extractAll() {
    void this.logger?.info('extractAll() called - starting initial scan');
    const startTime = Date.now();
    // We can't rely on all files being compiled (e.g. due to persistent
    // caching), so loading the messages initially is necessary.
    await this.manager.loadMessages();
    const loadDuration = Date.now() - startTime;
    void this.logger?.info('loadMessages() completed', {
      durationMs: loadDuration
    });

    const saveStartTime = Date.now();
    await this.manager.save();
    const saveDuration = Date.now() - saveStartTime;
    const totalDuration = Date.now() - startTime;
    void this.logger?.info('extractAll() completed', {
      loadDurationMs: loadDuration,
      saveDurationMs: saveDuration,
      totalDurationMs: totalDuration
    });
  }

  public [Symbol.dispose](): void {
    void this.logger?.info('ExtractionCompiler dispose() called');
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
