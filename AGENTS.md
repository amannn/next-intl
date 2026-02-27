# Agents

## Conventions

- Don't use single-character variable names, use descriptive names but keep them as short as possible.

## Workflows

### Always

- If running a test with vitest, use "run" to avoid being stuck in watch mode.
- When making a change to something in `./packages` and you want to test the updated behavior in consuming apps, you need to build the packages first (`pnpm -w build-packages`)

### When committing

- Make sure ESLint and Prettier pass on changed files.
- Make sure all tests pass.

### When creating a PR

- When creating a PR, use conventional commit prefixes for the PR title (e.g. `fix: `, `feat: `, ...).
