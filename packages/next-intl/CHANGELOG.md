# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 3.4.2 (2024-01-09)


### Bug Fixes

* Change `numeric` option from `auto` to `always` for `format.relativeTime` ([#765](https://github.com/amannn/next-intl/issues/765)) ([246d373](https://github.com/amannn/next-intl/commit/246d37320669c3525db03dc635b6cfcac8591b4a)), closes [#757](https://github.com/amannn/next-intl/issues/757)





## 3.4.1 (2024-01-03)


### Bug Fixes

* Fix ESM output of `use-intl` ([#754](https://github.com/amannn/next-intl/issues/754)) ([e73fb38](https://github.com/amannn/next-intl/commit/e73fb381c3f0eaeb15b3d9ab9aebc2c567c766ae))





# 3.4.0 (2023-12-21)


### Features

* Invoke `notFound()` when no locale was attached to the request and update docs to suggest validating the locale in `i18n.ts` ([#742](https://github.com/amannn/next-intl/issues/742)) ([e6d9878](https://github.com/amannn/next-intl/commit/e6d98787ad43aec50dcb6594353da83a958a81d1)), closes [#736](https://github.com/amannn/next-intl/issues/736) [#716](https://github.com/amannn/next-intl/issues/716) [/next-intl-docs.vercel.app/docs/usage/configuration#i18](https://github.com//next-intl-docs.vercel.app/docs/usage/configuration/issues/i18)





## 3.3.3 (2023-12-20)


### Bug Fixes

* Improve performance when calling hooks like `useTranslations` in Server Components by making sure we only suspend when i18n config is initially loaded and never for subsequent calls ([#741](https://github.com/amannn/next-intl/issues/741)) ([4185a72](https://github.com/amannn/next-intl/commit/4185a72525581dcd04f2646af00a0e330f8e02e0))





## 3.3.2 (2023-12-11)


### Bug Fixes

* Fix types for passing a custom `type` to `redirect` ([#714](https://github.com/amannn/next-intl/issues/714)) ([db65cb7](https://github.com/amannn/next-intl/commit/db65cb7737a605bd8f2c69bf1b28cd076bf40fcf)), closes [#709](https://github.com/amannn/next-intl/issues/709)





## 3.3.1 (2023-12-07)


### Bug Fixes

* Improve error message when encountering a missing message in production ([#706](https://github.com/amannn/next-intl/issues/706)) ([515891b](https://github.com/amannn/next-intl/commit/515891b539c723778d2a5a2e6c0186bb6f916071))





# 3.3.0 (2023-12-06)


### Features

* Add support for `basePath` in middleware and navigation APIs ([#699](https://github.com/amannn/next-intl/issues/699) by @Robjam and [@amannn](https://github.com/amannn)) ([f670f1b](https://github.com/amannn/next-intl/commit/f670f1b37d803c7fbb6fbaa1c8d10f88cf141a84))





## 3.2.5 (2023-12-06)


### Bug Fixes

* Correctly normalize pathname for redirects and alternate links when `localePrefix: 'as-needed'` is used with the default locale ([#698](https://github.com/amannn/next-intl/issues/698) by [@anna-colenso](https://github.com/anna-colenso)) ([48e9523](https://github.com/amannn/next-intl/commit/48e9523863b99b363f63f0aa991c72860d814d7e))





## 3.2.4 (2023-12-05)


### Bug Fixes

* Fix compatibility with `moduleResolution: 'Bundler'` ([#694](https://github.com/amannn/next-intl/issues/694)) ([f7425a5](https://github.com/amannn/next-intl/commit/f7425a54a1d35235ec84d2937006d43152cbbe16)), closes [#690](https://github.com/amannn/next-intl/issues/690)





## 3.2.3 (2023-12-05)


### Bug Fixes

* Prefer `locale` from `NextIntlClientProvider` when using `useLocale` in Client Components. `useParams().locale` is still used as a fallback. ([#691](https://github.com/amannn/next-intl/issues/691)) ([e00ed97](https://github.com/amannn/next-intl/commit/e00ed97746dc8d6c264b2f4aa9162681c1a89919)), closes [#688](https://github.com/amannn/next-intl/issues/688)





## 3.2.2 (2023-12-04)


### Bug Fixes

* Allow to call `getRequestConfig` in outer module closure in a Client Component module graph ([#687](https://github.com/amannn/next-intl/issues/687)) ([0f16f10](https://github.com/amannn/next-intl/commit/0f16f106a68a2a443eb0ec3671084d40bf466d2f)), closes [#685](https://github.com/amannn/next-intl/issues/685)





## 3.2.1 (2023-12-01)


### Bug Fixes

* Allow to import `next-intl/server` into Client Components (however not call any functions). This allows for easier testing of page components with multiple exports. ([#683](https://github.com/amannn/next-intl/issues/683)) ([5ca4075](https://github.com/amannn/next-intl/commit/5ca4075e58c152e898e9048f3002c11c7aef2dd9)), closes [#681](https://github.com/amannn/next-intl/issues/681)





# 3.2.0 (2023-11-29)


### Features

* Add `localePrefix` for navigation APIs for an improved initial render of `Link` when using `localePrefix: never`. Also fix edge case in middleware when using localized pathnames for redirects that remove a locale prefix (fixes an infinite loop). ([#678](https://github.com/amannn/next-intl/issues/678)) ([1c68e3b](https://github.com/amannn/next-intl/commit/1c68e3b549e2029cbae62d549f609e1d76ca6490)), closes [#444](https://github.com/amannn/next-intl/issues/444)





## 3.1.4 (2023-11-24)


### Bug Fixes

* Apply correct port and protocol during domain-based redirects when called from an internal address (e.g. from a proxy) ([#662](https://github.com/amannn/next-intl/issues/662)) ([2bb867d](https://github.com/amannn/next-intl/commit/2bb867d1747123763a4e0144a99236ca3a8bc884)), closes [#658](https://github.com/amannn/next-intl/issues/658)





## 3.1.3 (2023-11-22)


### Bug Fixes

* Don't set cookie on response if `localeDetection: false` ([#654](https://github.com/amannn/next-intl/issues/654)) ([e85149c](https://github.com/amannn/next-intl/commit/e85149cb27d9e036dda1712a03a152d5fe241986)), closes [#609](https://github.com/amannn/next-intl/issues/609)





## 3.1.2 (2023-11-20)


### Bug Fixes

* Update link to migration example in error messages ([#648](https://github.com/amannn/next-intl/issues/648) by [@outloudvi](https://github.com/outloudvi)) ([1f3b226](https://github.com/amannn/next-intl/commit/1f3b22672938dbc8421c918ed11438eca5436a32))





## 3.1.1 (2023-11-20)

**Note:** Version bump only for package next-intl





# 3.1.0 (2023-11-17)


### Features

* Experimental support for `--turbo` (requires `next@^14.0.3`) ([#641](https://github.com/amannn/next-intl/issues/641)) ([46c6ec7](https://github.com/amannn/next-intl/commit/46c6ec751651ac6d827fec6544a26d3abd5bb70a)), closes [#250](https://github.com/amannn/next-intl/issues/250)





## 3.0.3 (2023-11-15)


### Bug Fixes

* Don't retrieve defaults for `locale`, `now` and `timeZone` if these options have been provided to `NextIntlClientProvider` ([#633](https://github.com/amannn/next-intl/issues/633)) ([824363a](https://github.com/amannn/next-intl/commit/824363a97d4cc735cb627349e7e16c80fd22b25a)), closes [#631](https://github.com/amannn/next-intl/issues/631)





## 3.0.2 (2023-11-15)


### Bug Fixes

* Allow usage of `getTranslations({namespace})` without TypeScript integration for messages ([#630](https://github.com/amannn/next-intl/issues/630)) ([62cf29c](https://github.com/amannn/next-intl/commit/62cf29c978863cf65f62e34f739775901f0f6d8a)), closes [#625](https://github.com/amannn/next-intl/issues/625)





## 3.0.1 (2023-11-14)

Add provenance statement to published packages.

# 3.0.0 (2023-11-14)

Please refer to [the release notes](https://next-intl-docs.vercel.app/blog/next-intl-3-0).



## 2.22.1 (2023-11-02)


### Bug Fixes

* Correct version range ([ffbff8e](https://github.com/amannn/next-intl/commit/ffbff8ef6c028f61bf6d239dbc232e4a86cb452a))





# 2.22.0 (2023-11-02)


### Features

* Support Next.js 14 ([#593](https://github.com/amannn/next-intl/issues/593)) ([5c449f5](https://github.com/amannn/next-intl/commit/5c449f565f4ef3587555865d86775dd9c06b8a4d))





# 2.21.0 (2023-10-18)


### Features

* Support custom units in `format.relativeTime` ([#566](https://github.com/amannn/next-intl/issues/566)) ([6e1bc35](https://github.com/amannn/next-intl/commit/6e1bc35388ccae9f594be6b2d3078a56a10b0a76))





## 2.20.2 (2023-09-22)


### Bug Fixes

* Add error reporting when no `timeZone` is specified and downgrade error handling for missing `now` value from throwing to reporting an error ([#519](https://github.com/amannn/next-intl/issues/519)) ([dc55ab2](https://github.com/amannn/next-intl/commit/dc55ab24bcf4c8e84316fa044736f93d56d1a41d))





## 2.20.1 (2023-09-21)


### Bug Fixes

* Use correct port for alternate links when running behind a proxy ([#514](https://github.com/amannn/next-intl/issues/514) by [@iza-w](https://github.com/iza-w)) ([747ad5b](https://github.com/amannn/next-intl/commit/747ad5b38301499e8857be6eae6540257623752c))





# 2.20.0 (2023-08-23)


### Features

* Improve runtime performance of `useTranslations` by avoiding the creation of message format instances if possible and introducing a cross-component message format cache ([#475](https://github.com/amannn/next-intl/issues/475)) ([4d177f8](https://github.com/amannn/next-intl/commit/4d177f8a27eada4f056b79b77797b384a08111e5)), closes [#294](https://github.com/amannn/next-intl/issues/294)





## 2.19.4 (2023-08-23)


### Bug Fixes

* Allow to import `next-intl/link` into Server Components without having to add a wrapping Client Component ([#465](https://github.com/amannn/next-intl/issues/465)) ([21a0691](https://github.com/amannn/next-intl/commit/21a06913055028848d36474fe636a4e3e332f647))





## 2.19.3 (2023-08-23)


### Bug Fixes

* Apply time zone for built-in default formats (`full`, `long`, `medium`, `short`) ([#473](https://github.com/amannn/next-intl/issues/473)) ([244b9b2](https://github.com/amannn/next-intl/commit/244b9b2adf003d80d47a2d84b72a2ef77d32950f)), closes [#467](https://github.com/amannn/next-intl/issues/467)





## 2.19.2 (2023-08-22)


### Bug Fixes

* Use correct host and protocol for alternate links when running behind a proxy (`x-forwarded-host`, `x-forwarded-proto`) ([#462](https://github.com/amannn/next-intl/issues/462) by @HHongSeungWoo) ([747cf8e](https://github.com/amannn/next-intl/commit/747cf8ef71a2e27a39c2178353eb31cfda8170f2))





## 2.19.1 (2023-08-01)


### Bug Fixes

* Handle case where the `locale` param is an array and set cookie expiration to one year ([#435](https://github.com/amannn/next-intl/issues/435)) ([82e842c](https://github.com/amannn/next-intl/commit/82e842ce742106bf350246316855bd053f4cdac7))





# 2.19.0 (2023-07-18)


### Features

* Add `localePrefix: 'never'` option for middleware ([#388](https://github.com/amannn/next-intl/issues/388) by [@boris-arkenaar](https://github.com/boris-arkenaar)) ([92ec33a](https://github.com/amannn/next-intl/commit/92ec33a8c47929f0ef0902d60bd1f55b64b2cf91)), closes [#366](https://github.com/amannn/next-intl/issues/366)





# 2.18.0 (2023-07-17)


### Features

* Accept `locale` with `useRouter` APIs ([#409](https://github.com/amannn/next-intl/issues/409)) ([0fbb3c7](https://github.com/amannn/next-intl/commit/0fbb3c7cc9945eff40fe84ef433da172b909a8e6)), closes [#408](https://github.com/amannn/next-intl/issues/408) [#407](https://github.com/amannn/next-intl/issues/407) [#320](https://github.com/amannn/next-intl/issues/320)





## 2.17.5 (2023-07-07)


### Bug Fixes

* Use ESM build only for browser bundlers (not Node.js) ([#386](https://github.com/amannn/next-intl/issues/386)) ([34a69f2](https://github.com/amannn/next-intl/commit/34a69f29cf07032c8a02aaf2b94e7e60d3f35088))





## 2.17.4 (2023-07-05)


### Bug Fixes

* Bring back ESM build (and fix bundle size) ([#381](https://github.com/amannn/next-intl/issues/381)) ([4d0fefc](https://github.com/amannn/next-intl/commit/4d0fefcb558bcee6037dce7bd8cebe727257c8ca))





## 2.17.3 (2023-07-05)


### Bug Fixes

* Forward optional remaining args from Next.js router to wrapped `useRouter` ([3ff878c](https://github.com/amannn/next-intl/commit/3ff878c380d998171fbc777df1951d1c817ab9ad))





## 2.17.2 (2023-07-05)


### Bug Fixes

* Remove ESM build ([#379](https://github.com/amannn/next-intl/issues/379)) ([22d9f27](https://github.com/amannn/next-intl/commit/22d9f272a06b99b1d1f9f3079b44067b8349102b))





## 2.17.1 (2023-07-04)


### Bug Fixes

* Switch to `tsup` for more efficient bundling and also switch to `vitest` internally ([#375](https://github.com/amannn/next-intl/issues/375)) ([bf31626](https://github.com/amannn/next-intl/commit/bf31626046bbf5829c34b8b8fc31f5d47a2ab26e))





# 2.17.0 (2023-06-29)


### Features

* Add autocomplete support for `timeZone` ([#359](https://github.com/amannn/next-intl/issues/359) by @A7med3bdulBaset) ([630dfc2](https://github.com/amannn/next-intl/commit/630dfc282c1eb2c1fca7a4bce4eb172ff7c03087))





# 2.16.0 (2023-06-29)


### Features

* Add `useMessages` for convenience and restructure docs to be App Router-first ([#345](https://github.com/amannn/next-intl/issues/345)) ([0dedbfd](https://github.com/amannn/next-intl/commit/0dedbfd10411796c7a290f172ad03f406c7cccec))





## 2.15.1 (2023-06-21)


### Bug Fixes

* Allow usage of `next-intl/link` and `usePathname` outside of Next.js ([#338](https://github.com/amannn/next-intl/issues/338)) ([6e1a56c](https://github.com/amannn/next-intl/commit/6e1a56c8c7b708b578033b41c31436a4dde32afc)), closes [#337](https://github.com/amannn/next-intl/issues/337)





# 2.15.0 (2023-06-20)


### Features

* Add `format.list(…)` for formatting conjunctions and disjunctions ([#327](https://github.com/amannn/next-intl/issues/327) by [@stefanprobst](https://github.com/stefanprobst)) ([32cda32](https://github.com/amannn/next-intl/commit/32cda32f47112915bb2032f3f9cc02bf3a4e833b))





## 2.14.6 (2023-05-22)

**Note:** Version bump only for package next-intl





## 2.14.5 (2023-05-22)


### Bug Fixes

* Set `SameSite` attribute for locale cookie to `strict` ([#302](https://github.com/amannn/next-intl/issues/302)) ([0a6bce5](https://github.com/amannn/next-intl/commit/0a6bce5d57733487b99a7da5037c6195b9d2779b)), closes [#301](https://github.com/amannn/next-intl/issues/301)





## [2.14.4](https://github.com/amannn/next-intl/compare/v2.14.3...v2.14.4) (2023-05-22)


### Bug Fixes

* Move JSDoc for `next/link` ([b85b6f5](https://github.com/amannn/next-intl/commit/b85b6f53fc541f4832a750665060b40839574533))





## 2.14.3 (2023-05-22)


### Bug Fixes

* Accept `ref` for `next-intl/link` ([#300](https://github.com/amannn/next-intl/issues/300)) ([4d7cc17](https://github.com/amannn/next-intl/commit/4d7cc17de723c23fff81e2d77623f734a7cc9363)), closes [#299](https://github.com/amannn/next-intl/issues/299)





## 2.14.2 (2023-05-12)


### Bug Fixes

* Fix forwarding of request headers in middleware ([#269](https://github.com/amannn/next-intl/issues/269) by @ARochniak) ([4ecbab5](https://github.com/amannn/next-intl/commit/4ecbab55c53d88a287a11237eea80bd66233f8c1)), closes [#266](https://github.com/amannn/next-intl/issues/266)





## 2.14.1 (2023-05-11)


### Bug Fixes

* Fix support for older Next.js versions by moving `Link` to `next-intl/link` ([#288](https://github.com/amannn/next-intl/issues/288)) ([f26ef99](https://github.com/amannn/next-intl/commit/f26ef999bf92c142d56d0009259e5a224c5dec5b)), closes [#287](https://github.com/amannn/next-intl/issues/287)





# 2.14.0 (2023-05-10)


### Features

* Add navigation APIs for App Router (`useRouter`, `usePathname` and `Link`) ([#282](https://github.com/amannn/next-intl/issues/282)) ([e30a89b](https://github.com/amannn/next-intl/commit/e30a89b7079d31cfdefdd1a2d0c0a750adf3a6ce))





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
