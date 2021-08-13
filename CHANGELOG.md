# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 1.5.1 (2021-08-13)


### Bug Fixes

* Improve API for rendering raw messages and add docs ([#51](https://github.com/amannn/next-intl/issues/51)) ([19f4a7e](https://github.com/amannn/next-intl/commit/19f4a7e4e81e1cff78dc7e3f337dce69800be280))





# 1.5.0 (2021-08-10)


### Features

* Add flag to return raw messages ([#48](https://github.com/amannn/next-intl/issues/48)) ([b34e19f](https://github.com/amannn/next-intl/commit/b34e19ff618308b7d0c01e7969975215d96ff608))





## 1.4.7 (2021-08-02)


### Bug Fixes

* Adjust default for `onError` of the provider to log errors correctly ([#46](https://github.com/amannn/next-intl/issues/46)) ([d0a1986](https://github.com/amannn/next-intl/commit/d0a1986905e30acac40630e9ea6d099caad617fb))





## 1.4.6 (2021-08-02)


### Bug Fixes

* Use `timeZone` in translation function from `useTranslations` ([#45](https://github.com/amannn/next-intl/issues/45)) ([ebf75f2](https://github.com/amannn/next-intl/commit/ebf75f2add0ddc46f89768e9481bb16c56f94720))





## 1.4.5 (2021-07-26)

**Note:** Version bump only for package root





## 1.4.4 (2021-07-08)

**Note:** Version bump only for package root





## 1.4.3 (2021-07-08)

**Note:** Version bump only for package root





## [1.4.2](https://github.com/amannn/next-intl/compare/v1.4.1...v1.4.2) (2021-06-16)


### Bug Fixes

* Don't require `react-dom` as a peer dependency ([#39](https://github.com/amannn/next-intl/issues/39)) ([39edfcd](https://github.com/amannn/next-intl/commit/39edfcd9091e09570fc2152cda6a1e9ae5e7c210))





## [1.4.1](https://github.com/amannn/next-intl/compare/v1.4.0...v1.4.1) (2021-06-16)


### Bug Fixes

* Use correct version range for use-intl ([02c33d3](https://github.com/amannn/next-intl/commit/02c33d341794bdcf6ba30ca8325a6a843a684635))





# [1.4.0](https://github.com/amannn/next-intl/compare/v1.3.11...v1.4.0) (2021-06-16)


### Features

* Support Next.js 11 ([#36](https://github.com/amannn/next-intl/issues/36)) ([fc59871](https://github.com/amannn/next-intl/commit/fc5987156c2a74a9703e39f2b7ee19b84165fd77))





## 1.3.11 (2021-05-07)

**Note:** Version bump only for package root





## 1.3.10 (2021-05-02)

**Note:** Version bump only for package root





## 1.3.9 (2021-05-02)

**Note:** Version bump only for package root





## 1.3.8 (2021-03-26)

**Note:** Version bump only for package root





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
