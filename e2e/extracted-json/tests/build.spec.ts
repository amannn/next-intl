import {execFile} from 'child_process';
import {once} from 'events';
import {createRequire} from 'module';
import path from 'path';
import {fileURLToPath} from 'url';
import {promisify} from 'util';
import {expect, test as it} from '@playwright/test';
import {reserveSharedPlaywrightDevPort} from 'e2e-utils/playwright-dev-port';

const require = createRequire(import.meta.url);
const APP_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

for (const bundler of ['webpack', 'turbopack']) {
  it(`builds with ${bundler} and renders translated MDX and metadata`, async ({
    page,
    context
  }) => {
    it.setTimeout(300_000);
    // Also covers https://github.com/amannn/next-intl/issues/2429.
    const result = await promisify(execFile)(
      'pnpm',
      ['exec', 'next', 'build', `--${bundler}`],
      {
        cwd: APP_ROOT,
        env: {...process.env, E2E_WEBPACK_DEVTOOL: 'source-map'},
        maxBuffer: 10 * 1024 * 1024
      }
    );
    expect(result.stdout).toContain('Compiled successfully');

    const port = await reserveSharedPlaywrightDevPort(
      `PW_E2E_EXTRACTED_JSON_${bundler.toUpperCase()}_PORT`
    );
    const url = `http://localhost:${port}`;
    const server = execFile(
      process.execPath,
      [require.resolve('next/dist/bin/next'), 'start', '--port', String(port)],
      {cwd: APP_ROOT}
    );
    try {
      await expect
        .poll(
          async () => {
            try {
              return (await fetch(`${url}/mdx`)).status;
            } catch {
              return 0;
            }
          },
          {timeout: 30_000}
        )
        .toBe(200);
      await page.goto(`${url}/mdx`);
      await expect(page).toHaveTitle('MDX title');
      await expect(
        page.getByRole('heading', {name: 'MDX heading'})
      ).toBeVisible();
      await context.addCookies([{name: 'locale', value: 'de', url}]);
      await page.reload();
      await expect(page).toHaveTitle('MDX-Titel');
      await expect(
        page.getByRole('heading', {name: 'MDX-Überschrift'})
      ).toBeVisible();
      await expect(page.locator('strong')).toHaveText('Dokumentation');
    } finally {
      if (server.exitCode === null) {
        server.kill();
        await once(server, 'close');
      }
    }
  });
}
