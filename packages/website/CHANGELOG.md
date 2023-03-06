# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 2.11.0 (2023-03-06)


### Features

* Add `useFormatter` (replaces `useIntl`) ([#209](https://github.com/amannn/next-intl/issues/209)) ([021b682](https://github.com/amannn/next-intl/commit/021b682aa00063b040ccf1c927111780c1f0a710))





## 2.10.4 (2023-02-20)


### Bug Fixes

* Return up-to-date translations when messages change ([#199](https://github.com/amannn/next-intl/issues/199)) ([78f39b4](https://github.com/amannn/next-intl/commit/78f39b408933d6fcbb38d085704bfbe14065dc0a))





## 2.10.3 (2023-02-19)

**Note:** Version bump only for package website





## 2.10.2 (2022-12-09)


### Bug Fixes

* Remove magic `__DEV__` global ([#151](https://github.com/amannn/next-intl/issues/151)) ([7d5aa6a](https://github.com/amannn/next-intl/commit/7d5aa6a8fda0189adc6440214270e07a5593d98f))





## 2.10.1 (2022-12-09)

**Note:** Version bump only for package website





# 2.10.0 (2022-12-09)


### Features

* Add support for using `next-intl` in the `app` folder with Next.js 13 (see https://next-intl-docs.vercel.app/docs/next-13, [#144](https://github.com/amannn/next-intl/issues/144)) ([18c94d6](https://github.com/amannn/next-intl/commit/18c94d623a05afa7710fea83360f12f9811fb38d))





## 2.9.2 (2022-12-08)

**Note:** Version bump only for package website





## 2.9.1 (2022-11-03)

**Note:** Version bump only for package website





# 2.9.0 (2022-10-27)


### Features

* Next.js 13 compatibility ([#140](https://github.com/amannn/next-intl/issues/140)) ([65326a0](https://github.com/amannn/next-intl/commit/65326a0b47980f260df466a283a6e7a0aa5e1cd0)), closes [#139](https://github.com/amannn/next-intl/issues/139)





# 2.8.0 (2022-10-18)


### Features

* Provide `createTranslator` and `createIntl` by extracting a React-agnostic core library. Thanks to David Brands from Marvia for sponsoring the work on this feature, participating in discussion and providing feedback! ([#137](https://github.com/amannn/next-intl/issues/137)) ([91f7489](https://github.com/amannn/next-intl/commit/91f748972008b8587553b48aa36c95d7348b4b0c))





## 2.7.6 (2022-09-22)

**Note:** Version bump only for package website





## 2.7.5 (2022-08-30)

**Note:** Version bump only for package website





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


### Features

* Default translation values ([#86](https://github.com/amannn/next-intl/issues/86)) ([0ed5e70](https://github.com/amannn/next-intl/commit/0ed5e70ffc57dcdb1b7b9270dbce9e8475b3f478))





## 2.3.5 (2022-01-19)


### Bug Fixes

* Support identical wrappers with identical text content in rich text ([#80](https://github.com/amannn/next-intl/issues/80)) ([b35bb9f](https://github.com/amannn/next-intl/commit/b35bb9ffc5fa56c6260b6b424be3cd875f199aef))





## 2.3.4 (2022-01-04)


### Bug Fixes

* Allow usage outside of Next.js (e.g. Jest and Storybook) ([#76](https://github.com/amannn/next-intl/issues/76)) ([7c6925b](https://github.com/amannn/next-intl/commit/7c6925b39338be95c1c940c67a1ae2f5e3f85cdd))





## 2.3.3 (2021-12-23)

**Note:** Version bump only for package website





## 2.3.2 (2021-12-23)

**Note:** Version bump only for package website





## 2.3.1 (2021-12-23)

**Note:** Version bump only for package website
