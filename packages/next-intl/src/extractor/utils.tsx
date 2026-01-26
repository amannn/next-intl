import path from 'path';
import type {ExtractorMessage, ExtractorMessageReference} from './types.js';

export function normalizePathToPosix(filePath: string): string {
  // `path.relative` uses OS-specific separators. For stable `.po` references we
  // always use POSIX separators, regardless of the OS that ran extraction.
  return path.posix.normalize(
    filePath.split(path.win32.sep).join(path.posix.sep)
  );
}

// Essentialls lodash/set, but we avoid this dependency
export function setNestedProperty(
  obj: Record<string, any>,
  keyPath: string,
  value: any
): void {
  const keys = keyPath.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (
      !(key in current) ||
      typeof current[key] !== 'object' ||
      current[key] === null
    ) {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
}

export function getSortedMessages(
  messages: Array<ExtractorMessage>
): Array<ExtractorMessage> {
  return messages.toSorted((messageA, messageB) => {
    const refA = messageA.references?.[0];
    const refB = messageB.references?.[0];

    // No references: preserve original (extraction) order
    if (!refA || !refB) return 0;

    // Sort by path, then line. Same path+line: preserve original order
    return compareReferences(refA, refB);
  });
}

export function localeCompare(a: string, b: string) {
  return a.localeCompare(b, 'en');
}

export function compareReferences(
  refA: ExtractorMessageReference,
  refB: ExtractorMessageReference
): number {
  const pathCompare = localeCompare(refA.path, refB.path);
  if (pathCompare !== 0) return pathCompare;
  return (refA.line ?? 0) - (refB.line ?? 0);
}

export function getDefaultProjectRoot() {
  return process.cwd();
}
