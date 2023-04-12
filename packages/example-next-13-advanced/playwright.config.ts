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
  use: {
    baseURL: 'http://localhost:3000'
  },
  webServer: {
    reuseExistingServer: true,
    command: 'yarn start',
    port: 3000
  }
};

export default config;
