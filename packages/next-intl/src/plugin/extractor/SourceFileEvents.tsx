import fs from 'fs/promises';
import path from 'path';
import {SourceFileFilter, SourceFileScanner} from '@eloqnt/extractor/_internal';

/** A change to a file or directory, as reported by a file watcher. */
export type SourceFileEvent = {
  type: 'create' | 'update' | 'delete';
  path: string;
};

export async function normalizeEvents(
  events: Array<SourceFileEvent>
): Promise<Array<SourceFileEvent>> {
  const directoryCreatePaths: Array<string> = [];
  const otherEvents: Array<SourceFileEvent> = [];

  // We need to expand directory creates because during rename operations,
  // watchers like @parcel/watcher emit a directory create event but may not
  // emit individual file events for the moved files
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
  let expandedCreateEvents: Array<SourceFileEvent> = [];
  if (directoryCreatePaths.length > 0) {
    try {
      const sourceFiles =
        await SourceFileScanner.getSourceFiles(directoryCreatePaths);
      expandedCreateEvents = Array.from(sourceFiles).map(
        (filePath): SourceFileEvent => ({type: 'create', path: filePath})
      );
    } catch {
      // Directories might have been deleted or are inaccessible
    }
  }

  // Combine original events with expanded directory creates.
  // Deduplicate by path to avoid processing the same file twice
  // in case the watcher also emitted individual file events.
  const allEvents = [...otherEvents, ...expandedCreateEvents];
  const seenPaths = new Set<string>();
  const deduplicated: Array<SourceFileEvent> = [];
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

export function expandDirectoryDeleteEvents(
  events: Array<SourceFileEvent>,
  prevKnownFiles: Array<string>
): Array<SourceFileEvent> {
  const expanded: Array<SourceFileEvent> = [];

  for (const event of events) {
    if (event.type === 'delete' && !SourceFileFilter.isSourceFile(event.path)) {
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
