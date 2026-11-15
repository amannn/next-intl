import {warn} from './logging.js';
import type {ExtractorMessage} from './types.js';

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

export function warnAboutMissingReferences(
  messages: Array<ExtractorMessage>
): void {
  const warnedIds = new Set<string>();
  for (const message of messages) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (message.references[0] == null && !warnedIds.has(message.id)) {
      warnedIds.add(message.id);
      warn(`Missing file reference for extracted message: ${message.id}`);
    }
  }
}
