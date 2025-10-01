type SaveTask<T> = () => Promise<T>;

/**
 * De-duplicates excessive save invocations,
 * while keeping a single one instant.
 */
export default class SaveScheduler<T> {
  private saveTimeout?: NodeJS.Timeout;
  private isSaving = false;
  private delayMs: number;
  private pendingResolvers: Array<{
    resolve: (value: T) => void;
    reject: (error: unknown) => void;
  }> = [];

  constructor(delayMs = 50) {
    this.delayMs = delayMs;
  }

  async schedule(saveTask: SaveTask<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.pendingResolvers.push({resolve, reject});

      if (this.pendingResolvers.length === 1 && !this.isSaving) {
        // No pending saves and not currently saving, save immediately
        this.executeSave(saveTask);
      } else if (this.pendingResolvers.length > 1) {
        // Multiple pending saves, schedule/reschedule save
        this.scheduleSave(saveTask);
      }
    });
  }

  private scheduleSave(saveTask: SaveTask<T>): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      this.executeSave(saveTask);
    }, this.delayMs);
  }

  private async executeSave(saveTask: SaveTask<T>): Promise<void> {
    if (this.isSaving) {
      return;
    }

    this.isSaving = true;

    try {
      const result = await saveTask();

      // Resolve all pending promises with the same result
      this.pendingResolvers.forEach(({resolve}) => resolve(result));
    } catch (error) {
      // Reject all pending promises with the same error
      this.pendingResolvers.forEach(({reject}) => reject(error));
    } finally {
      this.pendingResolvers = [];
      this.isSaving = false;
    }
  }

  destroy(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = undefined;
    }
    this.pendingResolvers = [];
    this.isSaving = false;
  }
}
