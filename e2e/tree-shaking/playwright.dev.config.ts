import {defineConfig, devices} from '@playwright/test';

const PORT = process.env.CI ? 3012 : 3001;

export default defineConfig({
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  testDir: './tests',
  timeout: 180_000,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: `http://localhost:${PORT}`
  },
  webServer: {
    command: `_NEXT_INTL_TREE_SHAKING_IGNORE_INJECTED_MANIFEST=1 PORT=${PORT} pnpm dev`,
    port: PORT,
    reuseExistingServer: true
  },
  workers: 1
});
