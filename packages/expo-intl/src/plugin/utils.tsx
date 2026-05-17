import fs from 'fs';
import path from 'path';

function formatMessage(message: string): string {
  return `\n[expo-intl] ${message}\n`;
}

export function throwError(message: string): never {
  throw new Error(formatMessage(message));
}

export function warn(message: string): void {
  // eslint-disable-next-line no-console
  console.warn(formatMessage(message));
}

/**
 * Returns a function that runs the provided callback only once per process.
 * Metro can evaluate `metro.config.js` multiple times across reloads — this
 * guard ensures we only kick off the extraction watcher once. Uses an
 * environment variable so it survives module reloads.
 */
export function once(namespace: string): (fn: () => void) => void {
  return function runOnce(fn: () => void): void {
    if (process.env[namespace] === '1') {
      return;
    }
    process.env[namespace] = '1';
    fn();
  };
}

/**
 * Walks up from `startDir` looking for a `pnpm-workspace.yaml`, `package.json`
 * with a `workspaces` field, or a `lerna.json`. Returns the directory that
 * contains the workspace root, or `null` if none is found.
 *
 * Used to set Metro's `watchFolders` correctly inside a monorepo so symlinked
 * workspace packages get watched for changes.
 */
export function findWorkspaceRoot(startDir: string): string | null {
  let current = path.resolve(startDir);
  const {root} = path.parse(current);

  while (current !== root) {
    if (
      fs.existsSync(path.join(current, 'pnpm-workspace.yaml')) ||
      fs.existsSync(path.join(current, 'lerna.json'))
    ) {
      return current;
    }

    const pkgPath = path.join(current, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as {
          workspaces?: unknown;
        };
        if (pkg.workspaces) return current;
      } catch {
        // Ignore malformed package.json on the way up.
      }
    }

    current = path.dirname(current);
  }

  return null;
}
