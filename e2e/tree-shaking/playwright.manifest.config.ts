import {defineConfig} from '@playwright/test';

export default defineConfig({
  retries: process.env.CI ? 2 : 0,
  testDir: './tests',
  testMatch: 'manifest.spec.ts',
  timeout: 120_000
});
