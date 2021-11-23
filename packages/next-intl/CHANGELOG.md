# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 2.2.1 (2021-11-23)


### Bug Fixes

* Clearer error message when no messages are provided ([#66](https://github.com/amannn/next-intl/issues/66)) ([742729a](https://github.com/amannn/next-intl/commit/742729aaddd63367efc2b79ef0cdf93545abdfb0))





# 2.2.0 (2021-11-02)


### Features

* TypeScript improvements: Use enum type for `style` of `NumberFormatOptions`, only allow passing React children to messages rendered with `t.rich` and update `tslib` ([#63](https://github.com/amannn/next-intl/issues/63)) ([d73e935](https://github.com/amannn/next-intl/commit/d73e9358bf13c87c0a653bd9fbed35e41548ff1d))





## 2.1.1 (2021-10-28)

**Note:** Version bump only for package next-intl





# 2.1.0 (2021-10-27)


### Features

* Support Next.js 12 ([#61](https://github.com/amannn/next-intl/issues/61)) ([0391cc8](https://github.com/amannn/next-intl/commit/0391cc85d3401bca9df29080a569957f6be93c85))





## 2.0.5 (2021-09-28)

**Note:** Version bump only for package next-intl





## 2.0.4 (2021-09-28)

**Note:** Version bump only for package next-intl





## 2.0.3 (2021-09-17)

**Note:** Version bump only for package next-intl





## 2.0.2 (2021-09-17)


### Bug Fixes

* Render correct messages when the namespace changes in `useTranslations` ([#58](https://github.com/amannn/next-intl/issues/58)) ([b8f7dab](https://github.com/amannn/next-intl/commit/b8f7dab0e3a213a91bdcd7929547cd01ba0b5f54))





## 2.0.1 (2021-09-04)

**Note:** Version bump only for package next-intl





# 2.0.0 (2021-08-26)


* feat!: Use a separate API for rich text formatting to avoid type casting in TypeScript #54 ([4c13a64](https://github.com/amannn/next-intl/commit/4c13a644ce99992d9e57887afe35a09b8e3d6572)), closes [#54](https://github.com/amannn/next-intl/issues/54)


### BREAKING CHANGES

* Instead of using the `t` function for formatting both regular messages and rich text, this function will only work for regular messages now. For rich text you can use `t.rich` instead now.





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

**Note:** Version bump only for package next-intl





## 1.4.4 (2021-07-08)

**Note:** Version bump only for package next-intl





## 1.4.3 (2021-07-08)

**Note:** Version bump only for package next-intl





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

**Note:** Version bump only for package next-intl





## 1.3.10 (2021-05-02)

**Note:** Version bump only for package next-intl





## 1.3.9 (2021-05-02)

**Note:** Version bump only for package next-intl





## 1.3.8 (2021-03-26)

**Note:** Version bump only for package next-intl





## 1.3.7 (2021-02-12)

**Note:** Version bump only for package next-intl





## 1.3.6 (2021-02-09)

**Note:** Version bump only for package next-intl





## 1.3.5 (2021-02-09)

**Note:** Version bump only for package next-intl





## 1.3.4 (2021-02-09)

**Note:** Version bump only for package next-intl





## [1.3.3](https://github.com/amannn/next-intl/compare/v1.3.2...v1.3.3) (2021-02-09)

**Note:** Version bump only for package next-intl
