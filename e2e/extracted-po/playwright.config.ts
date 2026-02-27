import {defineConfig, devices} from '@playwright/test';

const PORT = process.env.CI ? 3022 : 3021;

export default defineConfig({
  fullyParallel: false,
  testDir: './tests',
  timeout: 120_000,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: `http://localhost:${PORT}`
  },
  webServer: {
    command: `PORT=${PORT} pnpm dev`,
    port: PORT,
    reuseExistingServer: !process.env.CI
  }
});
