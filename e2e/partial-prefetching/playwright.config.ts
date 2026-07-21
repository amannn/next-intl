import {defineConfig, devices} from '@playwright/test';
import {reserveSharedPlaywrightDevPort} from 'e2e-utils/playwright-dev-port';

const port = await reserveSharedPlaywrightDevPort(
  'PW_E2E_PARTIAL_PREFETCHING_PORT'
);

export default defineConfig({
  testDir: './tests',
  timeout: 120_000,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: `http://localhost:${port}`,
    launchOptions: process.env.CHROMIUM_EXECUTABLE_PATH
      ? {executablePath: process.env.CHROMIUM_EXECUTABLE_PATH}
      : undefined
  },
  webServer: {
    // Prefetching is only active in production
    command: `PORT=${port} pnpm start`,
    port,
    reuseExistingServer: !process.env.CI
  }
});
