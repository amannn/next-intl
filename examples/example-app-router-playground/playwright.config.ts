/* eslint-disable import/no-extraneous-dependencies */
import type {PlaywrightTestConfig} from '@playwright/test';
import {devices} from '@playwright/test';

// Use a distinct port on CI to avoid conflicts during concurrent tests
const PORT = process.env.CI ? 3004 : 3000;

// Forward to specs
process.env.PORT = PORT.toString();

const config: PlaywrightTestConfig = {
  retries: process.env.CI ? 2 : 0,
  testMatch: process.env.TEST_MATCH || 'main.spec.ts',
  testDir: './tests',
  projects: [
    {
      name: 'chromium',
      use: devices['Desktop Chrome']
    }
  ],
  fullyParallel: true,
  webServer: {
    command: `PORT=${PORT} pnpm start`,
    port: PORT,
    reuseExistingServer: true
  }
};

export default config;
