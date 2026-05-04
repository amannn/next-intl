import path from 'path';
import type {ExtractorMessage, ExtractorMessageReference} from './types.js';

export function normalizePathToPosix(filePath: string): string {
  // `path.relative` uses OS-specific separators. For stable `.po` references we
  // always use POSIX separators, regardless of the OS that ran extraction.
  return path.posix.normalize(
    filePath.split(path.win32.sep).join(path.posix.sep)
  );
}

const FORBIDDEN_OBJECT_KEYS = new Set([
  '__proto__',
  'constructor',
  'prototype'
]);

export function isForbiddenObjectKey(key: string): boolean {
  return FORBIDDEN_OBJECT_KEYS.has(key);
}

// Essentialls lodash/set, but we avoid this dependency
export function setNestedProperty(
  obj: Record<string, any>,
  keyPath: string,
  value: any
): void {
  const keys = keyPath.split('.');
  for (const key of keys) {
    if (isForbiddenObjectKey(key)) {
      throw new Error(`Invalid message id segment: ${key}`);
    }
  }

  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (
      !Object.prototype.hasOwnProperty.call(current, key) ||
      typeof current[key] !== 'object' ||
      current[key] === null
    ) {
      current[key] = Object.create(null);
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

    if (refA && refB) {
      const refCompare = compareReferences(refA, refB);
      if (refCompare !== 0) return refCompare;
    }

    // Tiebreaker for messages tied on (or missing) `references[0]`. Without
    // this, the sort falls back to insertion order in `messagesById`, which
    // is non-deterministic because source files are scanned via `fs.readdir`
    // and processed concurrently.
    return localeCompare(messageA.id, messageB.id);
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
