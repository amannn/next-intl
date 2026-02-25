# Agents

## Always

- If running a test with vitest, use "run" to avoid being stuck in watch mode.

## When committing

- Make sure ESLint and Prettier pass on changed files.
- Make sure all tests pass.

## When creating a PR

- When creating a PR, use conventional commit prefixes for the PR title (e.g. `fix: `, `feat: `, ...).

## Cursor Cloud specific instructions

This is a pnpm monorepo for `next-intl`, an i18n library for Next.js. No databases or external services are required.

### Core packages

| Package | Description |
|---|---|
| `icu-minify` | ICU message format compiler |
| `use-intl` | Framework-agnostic React i18n (dependency of next-intl) |
| `next-intl` | Main Next.js i18n library |

### Key commands

- **Install deps:** `pnpm install` (uses pnpm@9.11.0 via corepack)
- **Build packages:** `pnpm build-packages` (builds icu-minify, use-intl, next-intl via Turborepo; excludes Rust SWC plugin)
- **Lint a package:** `pnpm --filter <pkg> lint` (runs ESLint + TypeScript + Prettier + publint + attw)
- **Test a package:** `pnpm --filter <pkg> test run` (Vitest; always use `run` to avoid watch mode)
- **Run example app:** `pnpm --filter example-app-router dev`

### Non-obvious notes

- Packages must be built before tests or lint can run (turbo task dependencies handle this automatically).
- The `swc-plugin-extractor` package requires a Rust toolchain and is excluded from `build-packages`.
- The `tools` package provides shared Rollup/Babel build config used by all library packages.
- Tests use `TZ=Europe/Berlin` timezone override (set in each package's test script).
- One snapshot test in `next-intl` (`ExtractionCompiler.test.tsx`, "po format > merges descriptions") may fail due to non-deterministic Map iteration order — this is a pre-existing issue.
