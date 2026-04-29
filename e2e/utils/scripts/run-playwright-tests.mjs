#!/usr/bin/env node
/**
 * Allocates one free TCP port before Playwright loads any config subprocess.
 * Keeps playwright.config synchronous and aligns baseURL with webServer everywhere.
 */
import {spawn} from 'node:child_process';
import process from 'node:process';
import getPort from 'get-port';

const devPortEnv = process.env.E2E_PLAYWRIGHT_DEV_PORT;

if (!devPortEnv) {
  process.env.E2E_PLAYWRIGHT_DEV_PORT = String(await getPort({reserve: true}));
}

const childProcess = spawn(
  'pnpm',
  ['exec', 'playwright', ...process.argv.slice(2)],
  {
    cwd: process.cwd(),
    env: {...process.env},
    stdio: 'inherit'
  }
);

childProcess.on('close', (code) => process.exit(code ?? 1));
