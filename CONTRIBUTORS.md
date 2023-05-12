# Contributing to `next-intl`

Thank you so much for contributing to `next-intl`!

## Local development

### Setup

1. Make sure you have [pnpm](https://pnpm.io/) installed
2. Clone the repo
3. `pnpm install` (includes an initial build of the packages)

Now, you're all set and you can work on individual packages.

### Tests

There are currently two test setups:
1. **Packages**: These use [Jest](https://jestjs.io/) and support a watch mode via `pnpm test -- --watch`.
2. **Examples**: These use [Playwright](https://playwright.dev/) and currently don't have a watch mode.

In either case, you can focus individual tests during development via [`it.only`](https://jestjs.io/docs/api#testonlyname-fn-timeout).

## Pull requests

This repository uses [action-semantic-pull-request](https://github.com/amannn/action-semantic-pull-request) to ensure that pull request titles match the [Conventional Commits spec](https://www.conventionalcommits.org/en/v1.0.0/). This is due to PR titles being used as commit messages to automate the releases.
