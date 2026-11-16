import CatalogManager from './catalog/CatalogManager.js';
import MessageExtractor from './extractor/MessageExtractor.js';
import type {SourceFileEvent} from './source/SourceFileEvents.js';
import type {ExtractorConfig} from './types.js';

export default class ExtractionCompiler implements Disposable {
  private manager: CatalogManager;

  public constructor(
    config: ExtractorConfig,
    opts: {
      extractor?: MessageExtractor;
      isDevelopment?: boolean;
      projectRoot?: string;
      saveDebounceMs?: number;
      sourceMap?: boolean;
      warn?(message: string): void;
    } = {}
  ) {
    const extractor = opts.extractor ?? new MessageExtractor(opts);
    this.manager = new CatalogManager(config, {
      ...opts,
      extractor
    });
    this[Symbol.dispose] = this[Symbol.dispose].bind(this);
  }

  public async extractAll() {
    // We can't rely on all files being compiled (e.g. due to persistent
    // caching), so loading the messages initially is necessary.
    await this.manager.loadMessages();
    await this.manager.save();
  }

  /** Absolute paths of the directories to watch for `update`. */
  public getSrcPaths() {
    return this.manager.getSrcPaths();
  }

  /**
   * Re-extracts the files that changed. Events that arrive during the initial
   * `extractAll` are processed once it's done.
   */
  public update(events: Array<SourceFileEvent>) {
    return this.manager.update(events);
  }

  public [Symbol.dispose](): void {
    this.manager[Symbol.dispose]();
  }
}
