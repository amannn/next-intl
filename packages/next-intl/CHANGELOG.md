# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 2.13.4 (2023-05-05)

**Note:** Version bump only for package next-intl





## 2.13.3 (2023-05-05)

**Note:** Version bump only for package next-intl





## 2.13.2 (2023-05-03)


### Bug Fixes

* Improve warning for invalid namespace characters ([7435335](https://github.com/amannn/next-intl/commit/74353356a799de8b7505aa378b91c3d63febd073))





## 2.13.1 (2023-04-14)


### Bug Fixes

* Improve error message when trying to render an array as a message ([#244](https://github.com/amannn/next-intl/issues/244)) ([c6a4f7a](https://github.com/amannn/next-intl/commit/c6a4f7a338d0b2cf7be545cb5203949679c187fc))





# 2.13.0 (2023-04-12)


### Features

* Sync improvements from RSC branch to main ([#238](https://github.com/amannn/next-intl/issues/238)) ([1d12ba2](https://github.com/amannn/next-intl/commit/1d12ba219afdbca77663c9d20f18db746de033fd)), closes [#149](https://github.com/amannn/next-intl/issues/149) [#237](https://github.com/amannn/next-intl/issues/237)





# 2.12.0 (2023-03-25)


### Features

* Add `BigInt` support for `useFormatter.format()` by [@tacomanator](https://github.com/tacomanator) ([#222](https://github.com/amannn/next-intl/issues/222))  ([a5ded6c](https://github.com/amannn/next-intl/commit/a5ded6c4cd706d5361556865050c5948a4d78887))





# 2.11.0 (2023-03-06)


### Features

* Add `useFormatter` (replaces `useIntl`) ([#209](https://github.com/amannn/next-intl/issues/209)) ([021b682](https://github.com/amannn/next-intl/commit/021b682aa00063b040ccf1c927111780c1f0a710))





## 2.10.4 (2023-02-20)


### Bug Fixes

* Return up-to-date translations when messages change ([#199](https://github.com/amannn/next-intl/issues/199)) ([78f39b4](https://github.com/amannn/next-intl/commit/78f39b408933d6fcbb38d085704bfbe14065dc0a))





## 2.10.3 (2023-02-19)

**Note:** Version bump only for package next-intl





## 2.10.2 (2022-12-09)


### Bug Fixes

* Remove magic `__DEV__` global ([#151](https://github.com/amannn/next-intl/issues/151)) ([7d5aa6a](https://github.com/amannn/next-intl/commit/7d5aa6a8fda0189adc6440214270e07a5593d98f))





## 2.10.1 (2022-12-09)

**Note:** Version bump only for package next-intl





# 2.10.0 (2022-12-09)


### Features

* Add support for using `next-intl` in the `app` folder with Next.js 13 (see https://next-intl-docs.vercel.app/docs/next-13, [#144](https://github.com/amannn/next-intl/issues/144)) ([18c94d6](https://github.com/amannn/next-intl/commit/18c94d623a05afa7710fea83360f12f9811fb38d))





## 2.9.2 (2022-12-08)

**Note:** Version bump only for package next-intl





## 2.9.1 (2022-11-03)

**Note:** Version bump only for package next-intl





# 2.9.0 (2022-10-27)


### Features

* Next.js 13 compatibility ([#140](https://github.com/amannn/next-intl/issues/140)) ([65326a0](https://github.com/amannn/next-intl/commit/65326a0b47980f260df466a283a6e7a0aa5e1cd0)), closes [#139](https://github.com/amannn/next-intl/issues/139)





# 2.8.0 (2022-10-18)


### Features

* Provide `createTranslator` and `createIntl` by extracting a React-agnostic core library. Thanks to David Brands from Marvia for sponsoring the work on this feature, participating in discussion and providing feedback! ([#137](https://github.com/amannn/next-intl/issues/137)) ([91f7489](https://github.com/amannn/next-intl/commit/91f748972008b8587553b48aa36c95d7348b4b0c))





## 2.7.6 (2022-09-22)

**Note:** Version bump only for package next-intl





## 2.7.5 (2022-08-30)

**Note:** Version bump only for package next-intl





## 2.7.4 (2022-05-30)


### Bug Fixes

* Adapt TypeScript validation to work with messages files that only have a single top-level namespace ([#115](https://github.com/amannn/next-intl/issues/115)) ([cf0b83e](https://github.com/amannn/next-intl/commit/cf0b83e3a591cfe87e17537c3ca0c7000cc70b1e))





## 2.7.3 (2022-05-20)


### Bug Fixes

* Add back the ability to render the provider without messages ([#113](https://github.com/amannn/next-intl/issues/113)) ([8395822](https://github.com/amannn/next-intl/commit/8395822fa17cd0a04b88f8edce3b20e5e613fc78))





## 2.7.2 (2022-05-10)


### Bug Fixes

* Enable tree-shaking ([#108](https://github.com/amannn/next-intl/issues/108)) ([157b0e2](https://github.com/amannn/next-intl/commit/157b0e28376055e7e34e86007c51d008c8e214aa))





## 2.7.1 (2022-04-28)


### Bug Fixes

* Allow null message values ([#110](https://github.com/amannn/next-intl/issues/110)) ([14ae8ff](https://github.com/amannn/next-intl/commit/14ae8ffdf1b295873f14081e2c3709d0f9bd2b9e))





# 2.7.0 (2022-04-28)


### Features

* Warn for invalid namespace keys ([#106](https://github.com/amannn/next-intl/issues/106)) ([e86ab28](https://github.com/amannn/next-intl/commit/e86ab28b9180b866ce1a0a9173355d4b686b7d07))





# 2.6.0 (2022-04-08)


### Features

* Support React 18 ([#98](https://github.com/amannn/next-intl/issues/98)) ([38614eb](https://github.com/amannn/next-intl/commit/38614eb9c6d6fb96704424d7f3ff8a67a24b789e))





# 2.5.0 (2022-04-01)


### Features

* Type safe messages ([#93](https://github.com/amannn/next-intl/issues/93)) ([13b49b1](https://github.com/amannn/next-intl/commit/13b49b138bc0ec3adbe661af6a70dfabfe7e86b0))







## 2.4.1 (2022-03-24)


### Bug Fixes

* Overwrite prerelease ([6caf5c4](https://github.com/amannn/next-intl/commit/6caf5c48a35179f802503bc6580469187765c837))





# [2.4.0](https://github.com/amannn/next-intl/compare/v2.3.5...v2.4.0) (2022-02-08)

**Note:** Version bump only for package next-intl





## 2.3.5 (2022-01-19)


### Bug Fixes

* Support identical wrappers with identical text content in rich text ([#80](https://github.com/amannn/next-intl/issues/80)) ([b35bb9f](https://github.com/amannn/next-intl/commit/b35bb9ffc5fa56c6260b6b424be3cd875f199aef))





## 2.3.4 (2022-01-04)


### Bug Fixes

* Allow usage outside of Next.js (e.g. Jest and Storybook) ([#76](https://github.com/amannn/next-intl/issues/76)) ([7c6925b](https://github.com/amannn/next-intl/commit/7c6925b39338be95c1c940c67a1ae2f5e3f85cdd))





## 2.3.3 (2021-12-23)

**Note:** Version bump only for package next-intl





## 2.3.2 (2021-12-23)

**Note:** Version bump only for package next-intl





## 2.3.1 (2021-12-23)

**Note:** Version bump only for package next-intl





# 2.3.0 (2021-11-24)


### Features

* Add `useLocale` and `useTimeZone` ([#67](https://github.com/amannn/next-intl/issues/67)) ([7833f4a](https://github.com/amannn/next-intl/commit/7833f4adc1aadc937cbaa550a968ef6f7b4f5ee1))





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
