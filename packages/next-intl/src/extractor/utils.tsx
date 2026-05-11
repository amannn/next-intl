import path from 'path';
import {warn} from '../plugin/utils.js';
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
  const warnedMissingReferenceIds = new Set<string>();

  return messages.toSorted((messageA, messageB) => {
    const refA = messageA.references[0];
    const refB = messageB.references[0];

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (refA == null) {
      warnAboutMissingReference(messageA.id, warnedMissingReferenceIds);
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (refB == null) {
      warnAboutMissingReference(messageB.id, warnedMissingReferenceIds);
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (refA == null || refB == null) {
      return 0;
    }

    // Sort by path, then line. Same path+line: preserve original order
    return compareReferences(refA, refB);
  });
}

function warnAboutMissingReference(
  id: string,
  warnedMissingReferenceIds: Set<string>
): void {
  if (warnedMissingReferenceIds.has(id)) return;
  warnedMissingReferenceIds.add(id);
  warn(`Missing file reference for extracted message: ${id}`);
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
