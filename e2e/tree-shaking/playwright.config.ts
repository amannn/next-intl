import {defineConfig, devices} from '@playwright/test';

const PORT = process.env.CI ? 3011 : 3000;

export default defineConfig({
  fullyParallel: true,
  testDir: './tests',
  timeout: 120_000,
  retries: process.env.CI ? 2 : 0,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: `http://localhost:${PORT}`
  },
  webServer: {
    command: `PORT=${PORT} pnpm dev`,
    port: PORT,
    reuseExistingServer: true,
    timeout: 180_000
  }
});
