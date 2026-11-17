const FORBIDDEN_OBJECT_KEYS = new Set([
  '__proto__',
  'constructor',
  'prototype'
]);

function isForbiddenObjectKey(key: string): boolean {
  return FORBIDDEN_OBJECT_KEYS.has(key);
}

// Essentially lodash/set, but we avoid this dependency
export default function setNestedProperty(
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
