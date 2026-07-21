// Regression test for https://github.com/amannn/next-intl/discussions/2209
//
// When `experimental.messages.precompile` is enabled and `next-intl/plugin` is
// used through a workspace wrapper package (see `next.config.ts`), running
// `bun --bun next …` previously failed to load `next.config` with:
//
//   Cannot find module 'use-intl/format-message/format-only' from ''
//
// The plugin resolves the `format-only` build via `require.resolve`
// (`createRequire(import.meta.url)`). When Next bundles the config before
// evaluating it, `import.meta.url` is unavailable, so the resolution base is
// empty and `require.resolve` throws. The fix falls back to the bare specifier
// in that case.
//
// This test asserts that `next.config` *loads* under `bun --bun` (i.e. the
// plugin no longer throws while resolving `format-only`). It deliberately does
// not require the full build to finish: under `bun --bun`, Turbopack spawns a
// Node subprocess for message-catalog loaders that rejects the inherited
// `--bun`/`--smol` `NODE_OPTIONS`, which is unrelated to this regression.

import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const REPORTED_ERROR =
  "Cannot find module 'use-intl/format-message/format-only'";
const CONFIG_LOAD_ERROR = 'Failed to load next.config';

// The bug only reproduces on Bun's runtime (`--bun`), so skip when Bun is
// unavailable (e.g. a plain Node environment) rather than failing.
if (spawnSync('bun', ['--version'], {encoding: 'utf8'}).status !== 0) {
  console.log('Skipping: `bun` is not available in this environment.');
  process.exit(0);
}

const nextBin = require.resolve('next/dist/bin/next');

console.log('Running `bun --bun next build` …\n');
const result = spawnSync('bun', ['--bun', nextBin, 'build'], {
  encoding: 'utf8',
  stdio: 'pipe',
  timeout: 300_000
});

if (result.error) {
  console.error(`\n❌ Failed to run \`bun --bun next build\`: ${result.error}`);
  process.exit(1);
}

const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;

if (output.includes(REPORTED_ERROR) || output.includes(CONFIG_LOAD_ERROR)) {
  process.stdout.write(output);
  console.error(
    `\n❌ Regression: \`next.config\` failed to load under \`bun --bun\`.`
  );
  process.exit(1);
}

// Note: the full build may not finish here — under `bun --bun`, Turbopack
// spawns a Node subprocess for message-catalog loaders that rejects the
// inherited `--bun` `NODE_OPTIONS`. That is unrelated to this regression, so
// the surrounding output is only surfaced above when the config fails to load.
console.log('✅ `next.config` loaded successfully under `bun --bun`.');
