import fs from 'fs/promises';
import path from 'path';
import {type AsyncSubscription, type Event, subscribe} from '@parcel/watcher';
import SourceFileFilter from './SourceFileFilter.js';
import SourceFileScanner from './SourceFileScanner.js';

type OnChange = (events: Array<Event>) => Promise<void>;
type RootListener = (events: Array<Event>) => Promise<void>;
type SharedRootWatcher = {
  listeners: Set<RootListener>;
  startPromise?: Promise<void>;
  subscription?: AsyncSubscription;
};

export type SourceFileWatcherEvent = Event;

export default class SourceFileWatcher implements Disposable {
  private static sharedRootWatchers = new Map<string, SharedRootWatcher>();

  private rootListeners = new Map<string, RootListener>();
  private roots: Array<string>;
  private onChange: OnChange;

  public constructor(roots: Array<string>, onChange: OnChange) {
    this.roots = roots.map((root) => path.resolve(root));
    this.onChange = onChange;
  }

  private static getSharedRootWatcher(root: string): SharedRootWatcher {
    const existing = SourceFileWatcher.sharedRootWatchers.get(root);
    if (existing) {
      return existing;
    }

    const created: SharedRootWatcher = {
      listeners: new Set()
    };
    SourceFileWatcher.sharedRootWatchers.set(root, created);
    return created;
  }

  private static getIgnorePatternsForRoot(root: string): Array<string> {
    const rootParts = root.split(path.sep);
    return SourceFileFilter.IGNORED_DIRECTORIES.filter(
      (dir) => !rootParts.includes(dir)
    ).map((dir) => `**/${dir}/**`);
  }

  private static async dispatchRootEvents(root: string, events: Array<Event>) {
    const sharedRootWatcher = SourceFileWatcher.sharedRootWatchers.get(root);
    if (!sharedRootWatcher) return;

    await Promise.all(
      Array.from(sharedRootWatcher.listeners).map((listener) =>
        listener(events)
      )
    );
  }

  private static async ensureSubscription(
    root: string,
    sharedRootWatcher: SharedRootWatcher
  ) {
    if (sharedRootWatcher.subscription) {
      return;
    }

    if (!sharedRootWatcher.startPromise) {
      sharedRootWatcher.startPromise = subscribe(
        root,
        async (error, events) => {
          if (error) {
            console.error(error);
            return;
          }
          await SourceFileWatcher.dispatchRootEvents(root, events);
        },
        {ignore: SourceFileWatcher.getIgnorePatternsForRoot(root)}
      )
        .then((subscription) => {
          sharedRootWatcher.subscription = subscription;
        })
        .catch((error) => {
          sharedRootWatcher.startPromise = undefined;
          throw error;
        });
    }

    await sharedRootWatcher.startPromise;
  }

  private static async addRootListener(root: string, listener: RootListener) {
    const sharedRootWatcher = SourceFileWatcher.getSharedRootWatcher(root);
    sharedRootWatcher.listeners.add(listener);

    try {
      await SourceFileWatcher.ensureSubscription(root, sharedRootWatcher);
    } catch (error) {
      sharedRootWatcher.listeners.delete(listener);
      if (sharedRootWatcher.listeners.size === 0) {
        SourceFileWatcher.sharedRootWatchers.delete(root);
      }
      throw error;
    }
  }

  private static async removeRootListener(
    root: string,
    listener: RootListener
  ) {
    const sharedRootWatcher = SourceFileWatcher.sharedRootWatchers.get(root);
    if (!sharedRootWatcher) {
      return;
    }

    sharedRootWatcher.listeners.delete(listener);
    if (sharedRootWatcher.listeners.size > 0) {
      return;
    }

    try {
      await sharedRootWatcher.startPromise;
    } catch {
      // ignore
    }

    if (sharedRootWatcher.subscription) {
      await sharedRootWatcher.subscription.unsubscribe();
      sharedRootWatcher.subscription = undefined;
    }

    SourceFileWatcher.sharedRootWatchers.delete(root);
  }

  public async start() {
    if (this.rootListeners.size > 0) {
      return;
    }

    try {
      for (const root of new Set(this.roots)) {
        const listener: RootListener = async (events) => {
          const filtered = await this.normalizeEvents(events);
          if (filtered.length > 0) {
            void this.onChange(filtered);
          }
        };
        await SourceFileWatcher.addRootListener(root, listener);
        this.rootListeners.set(root, listener);
      }
    } catch (error) {
      await this.stop();
      throw error;
    }
  }

  private async normalizeEvents(events: Array<Event>): Promise<Array<Event>> {
    const directoryCreatePaths: Array<string> = [];
    const otherEvents: Array<Event> = [];

    // We need to expand directory creates because during rename operations,
    // @parcel/watcher emits a directory create event but may not emit individual
    // file events for the moved files
    await Promise.all(
      events.map(async (event) => {
        if (event.type === 'create') {
          try {
            const stats = await fs.stat(event.path);
            if (stats.isDirectory()) {
              directoryCreatePaths.push(event.path);
              return;
            }
          } catch {
            // Path doesn't exist or is inaccessible, treat as file
          }
        }
        otherEvents.push(event);
      })
    );

    // Expand directory create events to find source files inside
    let expandedCreateEvents: Array<Event> = [];
    if (directoryCreatePaths.length > 0) {
      try {
        const sourceFiles =
          await SourceFileScanner.getSourceFiles(directoryCreatePaths);
        expandedCreateEvents = Array.from(sourceFiles).map(
          (filePath): Event => ({type: 'create', path: filePath})
        );
      } catch {
        // Directories might have been deleted or are inaccessible
      }
    }

    // Combine original events with expanded directory creates.
    // Deduplicate by path to avoid processing the same file twice
    // in case @parcel/watcher also emitted individual file events.
    const allEvents = [...otherEvents, ...expandedCreateEvents];
    const seenPaths = new Set<string>();
    const deduplicated: Array<Event> = [];
    for (const event of allEvents) {
      const key = `${event.type}:${event.path}`;
      if (!seenPaths.has(key)) {
        seenPaths.add(key);
        deduplicated.push(event);
      }
    }

    return deduplicated.filter((event) => {
      // Keep all delete events (might be deleted directories that no longer exist)
      if (event.type === 'delete') {
        return true;
      }
      // Keep source files
      return SourceFileFilter.isSourceFile(event.path);
    });
  }

  public async expandDirectoryDeleteEvents(
    events: Array<Event>,
    prevKnownFiles: Array<string>
  ): Promise<Array<Event>> {
    const expanded: Array<Event> = [];

    for (const event of events) {
      if (
        event.type === 'delete' &&
        !SourceFileFilter.isSourceFile(event.path)
      ) {
        const dirPath = path.resolve(event.path);
        const filesInDirectory: Array<string> = [];

        for (const filePath of prevKnownFiles) {
          if (SourceFileFilter.isWithinPath(filePath, dirPath)) {
            filesInDirectory.push(filePath);
          }
        }

        // If we found files within this path, it was a directory
        if (filesInDirectory.length > 0) {
          for (const filePath of filesInDirectory) {
            expanded.push({type: 'delete', path: filePath});
          }
        } else {
          // Not a directory or no files in it, pass through as-is
          expanded.push(event);
        }
      } else {
        // Pass through as-is
        expanded.push(event);
      }
    }

    return expanded;
  }

  public async stop() {
    const listeners = Array.from(this.rootListeners.entries());
    this.rootListeners.clear();

    await Promise.all(
      listeners.map(([root, listener]) =>
        SourceFileWatcher.removeRootListener(root, listener)
      )
    );
  }

  public [Symbol.dispose](): void {
    void this.stop();
  }
}
