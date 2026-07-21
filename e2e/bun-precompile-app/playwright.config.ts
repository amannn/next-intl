import {defineConfig, devices} from '@playwright/test';
import {reserveSharedPlaywrightDevPort} from 'e2e-utils/playwright-dev-port';

const port = await reserveSharedPlaywrightDevPort(
  'PW_E2E_BUN_PRECOMPILE_DEV_PORT'
);

export default defineConfig({
  workers: 1,
  fullyParallel: false,
  testDir: './tests',
  timeout: 120_000,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: `http://localhost:${port}`
  },
  webServer: {
    // `--bun` runs Next.js on Bun's runtime instead of Node.js
    command: `PORT=${port} bun --bun run dev`,
    port,
    reuseExistingServer: !process.env.CI
  }
});
