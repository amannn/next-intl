import path from 'path';

function formatMessage(message: string) {
  return `\n[next-intl] ${message}\n`;
}

export function normalizePathToPosix(filePath: string): string {
  return path.posix.normalize(
    filePath.split(path.win32.sep).join(path.posix.sep)
  );
}

// Essentially lodash/set, but we avoid this dependency
export function setNestedProperty(
  obj: Record<string, unknown>,
  keyPath: string,
  value: unknown
): void {
  const keys = keyPath.split('.');
  let current: Record<string, unknown> = obj;

  for (let index = 0; index < keys.length - 1; index++) {
    const key = keys[index]!;
    if (
      !(key in current) ||
      typeof current[key] !== 'object' ||
      current[key] === null
    ) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }

  current[keys[keys.length - 1]!] = value;
}

export function throwError(message: string): never {
  throw new Error(formatMessage(message));
}

export function warn(message: string) {
  console.warn(formatMessage(message));
}

/**
 * Returns a function that runs the provided callback only once per process.
 * Next.js can call the config multiple times - this ensures we only run once.
 * Uses an environment variable to track execution across config loads.
 */
export function once(namespace: string) {
  return function runOnce(fn: () => void) {
    if (process.env[namespace] === '1') {
      return;
    }
    process.env[namespace] = '1';
    fn();
  };
}
