// Runs the Playwright tests for this app, with the dev server running on
// Bun's runtime (see `playwright.config.ts`). The regression this app guards
// against only occurs with `bun --bun` (see `tests/main.spec.ts`), so skip
// when Bun is unavailable (e.g. a plain Node.js environment) rather than
// failing.

import {spawnSync} from 'node:child_process';

if (spawnSync('bun', ['--version'], {encoding: 'utf8'}).status !== 0) {
  console.log('Skipping: `bun` is not available in this environment.');
  process.exit(0);
}

const result = spawnSync('pnpm', ['exec', 'playwright', 'test'], {
  stdio: 'inherit'
});
process.exit(result.status ?? 1);
