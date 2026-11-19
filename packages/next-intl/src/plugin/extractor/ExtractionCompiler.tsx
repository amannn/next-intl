import {MessageExtractor} from '@eloqnt/extractor/_internal';
import type {ExtractorConfig} from '../../extractor/types.js';
import CatalogManager from './CatalogManager.js';
import type {SourceFileEvent} from './SourceFileEvents.js';

/** Extraction for `next dev`, see `CatalogManager`. */
export default class ExtractionCompiler implements Disposable {
  private manager: CatalogManager;

  public constructor(
    config: ExtractorConfig,
    opts: {
      projectRoot: string;
      saveDebounceMs?: number;
      warn?(message: string): void;
    }
  ) {
    this.manager = new CatalogManager(config, {
      ...opts,
      extractor: new MessageExtractor({projectRoot: opts.projectRoot})
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
