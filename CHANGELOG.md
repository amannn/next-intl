# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 1.3.7 (2021-02-12)

**Note:** Version bump only for package root





## 1.3.6 (2021-02-09)

**Note:** Version bump only for package root





## 1.3.5 (2021-02-09)

**Note:** Version bump only for package root





## 1.3.4 (2021-02-09)

**Note:** Version bump only for package root





## [1.3.3](https://github.com/amannn/next-intl/compare/v1.3.2...v1.3.3) (2021-02-09)


### Bug Fixes

* Update DateTimeFormatOptions ([#29](https://github.com/amannn/next-intl/issues/29)) ([91a8f52](https://github.com/amannn/next-intl/commit/91a8f5216a9ef2a0e76be6e3e8bd706f5c7496a3))


## 1.3.2

- Fix: Limit the function signature to return strings or React elements

## 1.3.1

- Fix: Apply interval correctly in `useNow({updateInterval: …})`

## 1.3.0

- Feat: Add a global fallback for the `now` parameter of `formatRelativeTime`.
- Feat: Add `useNow` hook, which can be used in conjunction with `formatRelativeTime` to continuously update the result.
- Fix: Allow `messages` to be optional on the provider.

## 1.2.0

- Feat: Added specific types for `DateTimeFormatOptions`.

## 1.1.0

- Feat: Added support for handling time zones.

## 1.0.1

- Fix: Use 1.0 version of `use-intl`.

## 1.0.0

This library is now considered production ready. There are no changes from the previous version.

## 0.4.0

- Feature: Add global formats (see [docs](https://github.com/amannn/next-intl#global-formats))

## 0.3.2

- Fix: Export `IntlErrorCode` for JavaScript users.

## 0.3.1

- Fix: Return a stable function reference for `t`.

## 0.3.0

- Feature: Add error handling capabilities (see [docs](https://github.com/amannn/next-intl#error-handling))

## 0.2.0

- Chore: Depend on `use-intl`
- **BREAKING CHANGE**: Rename `NextIntlMessages` to `IntlMessages` (TypeScript only)

## 0.1.1

- Fix: Don't throw for empty messages (`""`).
