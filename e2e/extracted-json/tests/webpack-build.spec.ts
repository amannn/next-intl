import {execFile} from 'child_process';
import path from 'path';
import {fileURLToPath} from 'url';
import {promisify} from 'util';
import {expect, test as it} from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.join(__dirname, '..');

// https://github.com/amannn/next-intl/issues/2429
it('builds with webpack when source maps are enabled', async () => {
  it.setTimeout(300_000);

  // Next.js 16 uses `.next/dev` for the dev server, so this doesn't
  // interfere with the dev server that the other tests use
  const result = await promisify(execFile)(
    'pnpm',
    ['exec', 'next', 'build', '--webpack'],
    {
      cwd: APP_ROOT,
      env: {...process.env, E2E_WEBPACK_DEVTOOL: 'source-map'},
      maxBuffer: 10 * 1024 * 1024
    }
  ).catch((error: {stdout: string; stderr: string}) => error);

  expect(result.stderr).not.toContain('Build failed');
  expect(result.stdout).toContain('Compiled successfully');
});
