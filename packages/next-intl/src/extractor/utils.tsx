import type {ExtractorMessage} from './types.js';

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

    // Should practically never happen
    if (!refA || !refB) {
      return localeCompare(messageA.id, messageB.id);
    }

    const pathCompare = localeCompare(refA.path, refB.path);
    if (pathCompare !== 0) return pathCompare;

    const lineCompare = refA.line - refB.line;
    if (lineCompare !== 0) return lineCompare;

    return localeCompare(messageA.id, messageB.id);
  });
}

export function localeCompare(a: string, b: string) {
  return a.localeCompare(b, 'en');
}

export function getDefaultProjectRoot() {
  return process.cwd();
}
