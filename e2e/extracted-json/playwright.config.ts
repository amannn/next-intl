import {defineConfig, devices} from '@playwright/test';
import {getOrReservePlaywrightDevPort} from 'e2e-utils/playwright-dev-port';

const port = await getOrReservePlaywrightDevPort();

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
