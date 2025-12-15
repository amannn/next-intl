import type Logger from '../utils/Logger.js';

type SaveTask<T> = () => Promise<T>;

/**
 * De-duplicates excessive save invocations,
 * while keeping a single one instant.
 */
export default class SaveScheduler<Value> implements Disposable {
  private saveTimeout?: NodeJS.Timeout;
  private isSaving = false;
  private delayMs: number;
  private pendingResolvers: Array<{
    resolve(value: Value): void;
    reject(error: unknown): void;
  }> = [];
  private nextSaveTask?: SaveTask<Value>;
  private logger?: Logger;

  public constructor(delayMs = 50, logger?: Logger) {
    this.delayMs = delayMs;
    this.logger = logger;
  }

  public async schedule(saveTask: SaveTask<Value>): Promise<Value> {
    void this.logger?.info('SaveScheduler.schedule() called', {
      isSaving: this.isSaving,
      hasTimeout: !!this.saveTimeout,
      pendingResolvers: this.pendingResolvers.length
    });
    return new Promise((resolve, reject) => {
      this.pendingResolvers.push({resolve, reject});
      this.nextSaveTask = saveTask;

      if (!this.isSaving && !this.saveTimeout) {
        // Not currently saving and no scheduled save, save immediately
        void this.logger?.info(
          'SaveScheduler.schedule() - executing save immediately'
        );
        this.executeSave();
      } else if (this.saveTimeout) {
        // A save is already scheduled, reschedule to debounce
        void this.logger?.info(
          'SaveScheduler.schedule() - rescheduling save (debounce)'
        );
        this.scheduleSave();
      } else {
        void this.logger?.info(
          'SaveScheduler.schedule() - save in progress, will schedule after completion'
        );
      }
      // If isSaving is true and no timeout is scheduled, the current save
      // will check for pending resolvers when it completes and schedule
      // another save if needed (see finally block in executeSave)
    });
  }

  private scheduleSave(): void {
    if (this.saveTimeout) {
      void this.logger?.debug(
        'SaveScheduler.scheduleSave() - clearing existing timeout'
      );
      clearTimeout(this.saveTimeout);
    }

    void this.logger?.info('SaveScheduler.scheduleSave() - scheduling save', {
      delayMs: this.delayMs
    });
    this.saveTimeout = setTimeout(() => {
      this.saveTimeout = undefined;
      void this.logger?.info(
        'SaveScheduler.scheduleSave() - timeout fired, executing save'
      );
      this.executeSave();
    }, this.delayMs);
  }

  private async executeSave(): Promise<void> {
    if (this.isSaving) {
      void this.logger?.warn(
        'SaveScheduler.executeSave() - already saving, skipping'
      );
      return;
    }

    const saveTask = this.nextSaveTask;
    if (!saveTask) {
      void this.logger?.warn(
        'SaveScheduler.executeSave() - no save task, skipping'
      );
      return;
    }

    void this.logger?.info('SaveScheduler.executeSave() - starting save', {
      pendingResolvers: this.pendingResolvers.length
    });
    const startTime = Date.now();

    // Capture current pending resolvers for this save
    const resolversForThisSave = this.pendingResolvers;
    this.pendingResolvers = [];
    this.nextSaveTask = undefined;
    this.isSaving = true;

    try {
      const result = await saveTask();
      const duration = Date.now() - startTime;
      void this.logger?.info(
        'SaveScheduler.executeSave() - save completed successfully',
        {
          durationMs: duration,
          resolvedPromises: resolversForThisSave.length
        }
      );

      // Resolve only the promises that were pending when this save started
      resolversForThisSave.forEach(({resolve}) => resolve(result));
    } catch (error) {
      const duration = Date.now() - startTime;
      void this.logger?.error('SaveScheduler.executeSave() - save failed', {
        durationMs: duration,
        error: String(error),
        rejectedPromises: resolversForThisSave.length
      });
      // Reject only the promises that were pending when this save started
      resolversForThisSave.forEach(({reject}) => reject(error));
    } finally {
      this.isSaving = false;

      // If new saves were requested during this save, schedule another
      if (this.pendingResolvers.length > 0) {
        void this.logger?.info(
          'SaveScheduler.executeSave() - scheduling next save',
          {
            pendingResolvers: this.pendingResolvers.length
          }
        );
        this.scheduleSave();
      }
    }
  }

  public [Symbol.dispose](): void {
    void this.logger?.info('SaveScheduler.dispose() called');
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = undefined;
    }
    this.pendingResolvers = [];
    this.nextSaveTask = undefined;
    this.isSaving = false;
  }
}
