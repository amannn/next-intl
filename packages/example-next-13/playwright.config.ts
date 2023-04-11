/* eslint-disable import/no-extraneous-dependencies */
import type {PlaywrightTestConfig} from '@playwright/test';
import {devices} from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests',
  projects: [
    {
      name: 'chromium',
      use: devices['Desktop Chrome']
    }
  ],
  webServer: {
    command: 'yarn start',
    port: 3000,
    reuseExistingServer: true
  }
};

export default config;
