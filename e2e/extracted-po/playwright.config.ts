import {defineConfig, devices} from '@playwright/test';

function readDevPort(): number {
  const env = process.env.E2E_PLAYWRIGHT_DEV_PORT;
  if (!env) {
    throw new Error(
      'Missing E2E_PLAYWRIGHT_DEV_PORT. Run tests via package.json `"test"` (see e2e/utils/scripts/run-playwright-tests.mjs).'
    );
  }
  const parsed = Number(env);
  if (!Number.isInteger(parsed)) {
    throw new Error(`Invalid E2E_PLAYWRIGHT_DEV_PORT: ${env}`);
  }
  return parsed;
}

const port = readDevPort();

export default defineConfig({
  fullyParallel: false,
  testDir: './tests',
  timeout: 120_000,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: `http://localhost:${port}`
  },
  webServer: {
    command: `PORT=${port} pnpm dev`,
    port,
    reuseExistingServer: true
  }
});
