import CatalogManager from './catalog/CatalogManager.js';
import type {ExtractorConfig} from './types.js';

export default class ExtractionCompiler {
  private manager: CatalogManager;
  private isDevelopment = false;
  private initialScanPromise: Promise<void> | undefined;

  constructor(
    config: ExtractorConfig,
    opts: {isDevelopment?: boolean; projectRoot?: string} = {}
  ) {
    this.manager = new CatalogManager(config, opts);
    this.isDevelopment = opts.isDevelopment ?? false;

    // Kick off the initial scan as early as possible,
    // while awaiting it in `compile`. This also ensures
    // we're only scanning once.
    this.initialScanPromise = this.performInitialScan();
  }

  public async compile(resourcePath: string, source: string) {
    if (this.initialScanPromise) {
      await this.initialScanPromise;
      this.initialScanPromise = undefined;
    }

    const result = await this.manager.extractFileMessages(resourcePath, source);

    if (this.isDevelopment && result.changed) {
      // While we await the AST modification, we
      // don't need to await the persistence
      void this.manager.save();
    }

    return result.source;
  }

  private async performInitialScan(): Promise<void> {
    // We can't rely on all files being compiled (e.g. due to persistent
    // caching), so loading the messages initially is necessary.
    await this.manager.loadMessages();
    await this.manager.save();
  }

  public async extract() {
    await this.initialScanPromise;
  }

  [Symbol.dispose](): void {
    this.manager.destroy();
  }
}
