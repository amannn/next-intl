/* eslint-disable import/no-extraneous-dependencies */
import type {PlaywrightTestConfig} from '@playwright/test';
import {devices} from '@playwright/test';

// Use a distinct port on CI to avoid conflicts during concurrent tests
const PORT = process.env.CI ? 3003 : 3000;

const config: PlaywrightTestConfig = {
  retries: process.env.CI ? 1 : 0,
  testMatch:
    process.env.NEXT_PUBLIC_LOCALE_PREFIX === 'never'
      ? 'locale-prefix-never.spec.ts'
      : 'main.spec.ts',
  testDir: './tests',
  projects: [
    {
      name: 'chromium',
      use: devices['Desktop Chrome']
    }
  ],
  webServer: {
    command: `PORT=${PORT} pnpm start`,
    port: PORT,
    reuseExistingServer: true
  }
};

export default config;
