import {defineConfig} from '@playwright/test';
import {reserveSharedPlaywrightDevPort} from 'e2e-utils/playwright-dev-port';

const port = await reserveSharedPlaywrightDevPort('PW_E2E_DOMAINS_PORT');

export default defineConfig({
  testDir: './tests',
  timeout: 120_000,
  use: {
    baseURL: `http://127.0.0.1:${port}`
  },
  webServer: {
    command: `PORT=${port} pnpm start`,
    port,
    reuseExistingServer: !process.env.CI
  }
});
