import CatalogManager from './catalog/CatalogManager.js';
import type {ExtractedMessage, ExtractorConfig} from './types.js';

export default class ExtractionCompiler {
  private manager: CatalogManager;
  private isDevelopment: boolean;
  private initialScanPromise: Promise<void> | undefined;

  constructor(
    config: ExtractorConfig,
    opts?: {isDevelopment?: boolean; projectRoot?: string}
  ) {
    this.manager = new CatalogManager(config, opts);

    if (opts?.isDevelopment == null) {
      // Avoid rollup's `replace` plugin to compile this away
      const nodeEnv = process.env['NODE_ENV'.trim()];

      // We only want to emit messages continuously in development.
      // In production, we can do a single extraction pass.
      this.isDevelopment = nodeEnv === 'development';
    } else {
      this.isDevelopment = opts.isDevelopment;
    }

    // Kick off the initial scan as early as possible,
    // while awaiting it in `compile`. This also ensure
    // we're only scanning once.
    this.initialScanPromise = this.performInitialScan();
  }

  public async compile(resourcePath: string, source: string) {
    if (this.initialScanPromise) {
      await this.initialScanPromise;
      this.initialScanPromise = undefined;
    }

    const beforeMessages = this.manager.getFileMessages(resourcePath);
    const result = await this.manager.extractFileMessages(resourcePath, source);
    const afterMessages = this.manager.getFileMessages(resourcePath);
    const changed = this.haveMessagesChanged(beforeMessages, afterMessages);

    if (this.isDevelopment && changed) {
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

  private haveMessagesChanged(
    messages1: Map<string, ExtractedMessage> | undefined,
    messages2: Map<string, ExtractedMessage> | undefined
  ): boolean {
    // If one exists and the other doesn't, there's a change
    if (!messages1 || !messages2) {
      return messages1 !== messages2;
    }

    // Different sizes means changes
    if (messages1.size !== messages2.size) {
      return true;
    }

    // Check differences in messages1 vs messages2
    for (const [id, msg1] of messages1) {
      const msg2 = messages2.get(id);
      if (!msg2 || msg1.message !== msg2.message) {
        return true; // Early exit on first difference
      }
    }

    return false;
  }
}
