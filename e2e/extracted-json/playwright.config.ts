import {defineConfig, devices} from '@playwright/test';
import getPort from 'get-port';

/**
 * Playwright may load config in runner and worker processes — share one reservation via env.
 */
const ENV_KEY = 'PW_E2E_EXTRACTED_JSON_DEV_PORT';

const portString =
  process.env[ENV_KEY] !== undefined && process.env[ENV_KEY] !== ''
    ? process.env[ENV_KEY]
    : String(await getPort({reserve: true}));

process.env[ENV_KEY] = portString;

const port = Number(portString);

export default defineConfig({
  workers: 1,
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
