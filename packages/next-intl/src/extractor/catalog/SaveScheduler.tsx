type SaveTask<T> = () => Promise<T>;

/**
 * De-duplicates excessive save invocations,
 * while keeping a single one instant.
 */
export default class SaveScheduler<Value> {
  private saveTimeout?: NodeJS.Timeout;
  private isSaving = false;
  private delayMs: number;
  private pendingResolvers: Array<{
    resolve(value: Value): void;
    reject(error: unknown): void;
  }> = [];
  private nextSaveTask?: SaveTask<Value>;

  constructor(delayMs = 50) {
    this.delayMs = delayMs;
  }

  async schedule(saveTask: SaveTask<Value>): Promise<Value> {
    return new Promise((resolve, reject) => {
      this.pendingResolvers.push({resolve, reject});
      this.nextSaveTask = saveTask;

      if (!this.isSaving && !this.saveTimeout) {
        // Not currently saving and no scheduled save, save immediately
        this.executeSave();
      } else if (this.saveTimeout) {
        // A save is already scheduled, reschedule to debounce
        this.scheduleSave();
      }
      // If isSaving is true and no timeout is scheduled, the current save
      // will check for pending resolvers when it completes and schedule
      // another save if needed (see finally block in executeSave)
    });
  }

  private scheduleSave(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      this.saveTimeout = undefined;
      this.executeSave();
    }, this.delayMs);
  }

  private async executeSave(): Promise<void> {
    if (this.isSaving) {
      return;
    }

    const saveTask = this.nextSaveTask;
    if (!saveTask) {
      return;
    }

    // Capture current pending resolvers for this save
    const resolversForThisSave = this.pendingResolvers;
    this.pendingResolvers = [];
    this.nextSaveTask = undefined;
    this.isSaving = true;

    try {
      const result = await saveTask();

      // Resolve only the promises that were pending when this save started
      resolversForThisSave.forEach(({resolve}) => resolve(result));
    } catch (error) {
      // Reject only the promises that were pending when this save started
      resolversForThisSave.forEach(({reject}) => reject(error));
    } finally {
      this.isSaving = false;

      // If new saves were requested during this save, schedule another
      if (this.pendingResolvers.length > 0) {
        this.scheduleSave();
      }
    }
  }

  destroy(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = undefined;
    }
    this.pendingResolvers = [];
    this.nextSaveTask = undefined;
    this.isSaving = false;
  }
}
