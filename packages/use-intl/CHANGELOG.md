# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 4.3.6 (2025-09-04)

### Bug Fixes

* Ensure messages declaration continues working in `next dev` for upcoming `next@15.5.1` ([#2008](https://github.com/amannn/next-intl/issues/2008)) ([2bf09ec](https://github.com/amannn/next-intl/commit/2bf09ecefbfe6f3eb57a166d257c4a0cc11724c6)) – by @amannn

## 4.3.5 (2025-08-21)

### Bug Fixes

* Don't create messages declaration file when running `next {start,info,telemetry}` ([#1992](https://github.com/amannn/next-intl/issues/1992)) ([fd0722a](https://github.com/amannn/next-intl/commit/fd0722a15f38f982fdd30f61bc1637c80abfe138)) – by @amannn

## 4.3.4 (2025-07-02)

### Bug Fixes

* Correctly compile messages containing escaped curly braces (e.g. `'{name'}`) ([#1950](https://github.com/amannn/next-intl/issues/1950)) ([4d418f4](https://github.com/amannn/next-intl/commit/4d418f45679e471437ac5d2faafc9a68b9106bf8)), closes [#1948](https://github.com/amannn/next-intl/issues/1948) – by @amannn

## 4.3.3 (2025-07-01)

### Bug Fixes

* Add friendly error message when failing to load current Next.js version ([#1945](https://github.com/amannn/next-intl/issues/1945)) ([5021773](https://github.com/amannn/next-intl/commit/502177306ca0e1e8a30fe09d38bcb71cac84d7f7)) – by @cupofjoakim

## 4.3.2 (2025-07-01)

### Bug Fixes

* Ensure cookie is synced before navigation with `useRouter` ([#1947](https://github.com/amannn/next-intl/issues/1947)) ([3ee9c4d](https://github.com/amannn/next-intl/commit/3ee9c4d27384c86d17c7141da54d5a9e4970164e)) – by @amannn

## 4.3.1 (2025-06-24)

### Bug Fixes

* Don't encode hashes in unknown pathnames ([#1935](https://github.com/amannn/next-intl/issues/1935)) ([65978d2](https://github.com/amannn/next-intl/commit/65978d245dcc1550f4dfa30b75dcb9adc4379a5d)) – by @amannn

## 4.3.0 (2025-06-23)

### Features

* Support BigInt for `number` interpolation with `useTranslations` ([#1929](https://github.com/amannn/next-intl/issues/1929)) ([a893330](https://github.com/amannn/next-intl/commit/a893330470cf435392996159579c706780c7c071)), closes [#1928](https://github.com/amannn/next-intl/issues/1928) – by @sgleisner

## 4.2.0 (2025-06-23)

### Features

* Encode non-ASCII characters in pathnames returned from navigation APIs ([#1923](https://github.com/amannn/next-intl/issues/1923)) ([3d23c61](https://github.com/amannn/next-intl/commit/3d23c6134c8e73c084a2c75f8029cd9e7b155418)) – by @amannn

## 4.1.0 (2025-04-24)

### Features

* Add `forcePrefix` option for `redirect` and `getPathname` ([#1865](https://github.com/amannn/next-intl/issues/1865)) ([5905976](https://github.com/amannn/next-intl/commit/5905976daaa9cb6e4b07af5246d5a7cdfe958cf4)) – by @amannn

## 4.0.3 (2025-04-22)

### Bug Fixes

* Support stable Turbopack config in Next.js 15.3 ([#1850](https://github.com/amannn/next-intl/issues/1850)) ([30ec8e0](https://github.com/amannn/next-intl/commit/30ec8e0d4a2f7cf4d7c587a6059e0b235df879b6)), closes [#1838](https://github.com/amannn/next-intl/issues/1838) – by @amannn

## 4.0.2 (2025-03-13)

### Bug Fixes

* Allow to use `IntlErrorCode` in user code ([#1788](https://github.com/amannn/next-intl/issues/1788)) ([913d307](https://github.com/amannn/next-intl/commit/913d3078ac63892ab086214a0418ca37b382cd7e)), closes [#1787](https://github.com/amannn/next-intl/issues/1787) – by @amannn

## 4.0.1 (2025-03-12)

### Bug Fixes

* Handle default exports correctly for `moduleResolution: 'node'` ([#1785](https://github.com/amannn/next-intl/issues/1785)) ([b7a4a83](https://github.com/amannn/next-intl/commit/b7a4a83e584b1a7f00b287a07da84ef682d748a1)), closes [/github.com/amannn/next-intl/discussions/1631#discussioncomment-12477848](https://github.com/amannn//github.com/amannn/next-intl/discussions/1631/issues/discussioncomment-12477848) – by @amannn

## 4.0.0 (2025-03-12)

### ⚠ BREAKING CHANGES

* See [announcement](https://next-intl.dev/blog/next-intl-4-0)

### Features

* `next-intl@4` ([#1412](https://github.com/amannn/next-intl/issues/1412)) ([172656f](https://github.com/amannn/next-intl/commit/172656fc6a25c6deb2ce6d152eede201262c13bf)) – by @amannn

## 3.26.5 (2025-02-21)

### Bug Fixes

* Handle `query` in `<Link />` correctly when using `localePrefix: 'as-needed'` with `domains` ([#1732](https://github.com/amannn/next-intl/issues/1732)) ([ec8776e](https://github.com/amannn/next-intl/commit/ec8776e8f0344f78fea4f71284c48312484a7059)), closes [#1731](https://github.com/amannn/next-intl/issues/1731) – by @amannn

## 3.26.4 (2025-02-18)

### Bug Fixes

* Add workaround for OpenTelemetry/Zone.js ([#1719](https://github.com/amannn/next-intl/issues/1719)) ([1cac9a6](https://github.com/amannn/next-intl/commit/1cac9a65d2aefe20ff7fcf734e70f1fe85cac19d)), closes [#1711](https://github.com/amannn/next-intl/issues/1711) – by @amannn

## 3.26.3 (2024-12-20)

### Bug Fixes

* Add missing deprecation warnings for `next-intl@4.0` ([#1485](https://github.com/amannn/next-intl/issues/1485)) ([1d60d08](https://github.com/amannn/next-intl/commit/1d60d08c446d9eeac8bcc5bfbd0654113a737518)) – by @amannn

## 3.26.2 (2024-12-18)

### Bug Fixes

* Support `t.has` when `getTranslations` is called with an object argument ([#1616](https://github.com/amannn/next-intl/issues/1616)) ([64895a2](https://github.com/amannn/next-intl/commit/64895a2bb3c445f6e3deab85152a0d04ced17e46)), closes [/github.com/amannn/next-intl/discussions/437#discussioncomment-11593318](https://github.com/amannn//github.com/amannn/next-intl/discussions/437/issues/discussioncomment-11593318) – by @amannn

## 3.26.1 (2024-12-11)

### Bug Fixes

* Use new domain `next-intl.dev` in links ([#1601](https://github.com/amannn/next-intl/issues/1601)) ([40a9a77](https://github.com/amannn/next-intl/commit/40a9a7722edc8e7787ed799a4bf1d3c4a2e04848)) – by @amannn

## 3.26.0 (2024-12-06)

### Features

* Support React 19 ([#1597](https://github.com/amannn/next-intl/issues/1597)) ([e0ffe29](https://github.com/amannn/next-intl/commit/e0ffe292a3cae8955fcd06bd8e8e2b02c525ef69)) – by @amannn

## 3.25.3 (2024-11-26)

### Bug Fixes

* Follow-up for [#1573](https://github.com/amannn/next-intl/issues/1573) to also handle the case when a non-default locale is in use ([#1578](https://github.com/amannn/next-intl/issues/1578)) ([fd71741](https://github.com/amannn/next-intl/commit/fd7174179881a19e3573fceb9c6e903923644761)), closes [#1568](https://github.com/amannn/next-intl/issues/1568) – by @amannn

## 3.25.2 (2024-11-25)

### Bug Fixes

* Handle inconsistency in Next.js when using `usePathname` with custom prefixes, `localePrefix: 'as-needed'` and static rendering ([#1573](https://github.com/amannn/next-intl/issues/1573)) ([20fd0f0](https://github.com/amannn/next-intl/commit/20fd0f0015839357893bcd256ff880a98b01ea1f)) – by @amannn

## 3.25.1 (2024-11-13)

### Bug Fixes

* Correctly handle search params in redirects when using `trailingSlash: true` ([#1537](https://github.com/amannn/next-intl/issues/1537)) ([03a4620](https://github.com/amannn/next-intl/commit/03a4620432ff063b2b84f4dba5c49ae36b92fd73)) – by @deini

## 3.25.0 (2024-11-08)

### Features

* Add type exports to enable `declaration: true` in `tsconfig.json` ([#1509](https://github.com/amannn/next-intl/issues/1509)) ([6b2ca9c](https://github.com/amannn/next-intl/commit/6b2ca9cfddcf8611893f76f9690e0bafb534e8fd)) – by @osaton

## 3.24.0 (2024-10-31)

### Features

* Add support for React 19 RC ([#1490](https://github.com/amannn/next-intl/issues/1490)) ([2dea022](https://github.com/amannn/next-intl/commit/2dea02271f79e183dfd18a3c77112a79e1fce581)) – by @amannn

## 3.23.5 (2024-10-24)

### Bug Fixes

* Don't warn when setting `prefetch={true}` on `<Link />` ([#1463](https://github.com/amannn/next-intl/issues/1463)) ([fd6d73d](https://github.com/amannn/next-intl/commit/fd6d73dc145a0679e85a1a71fe40c43d3312e27e)), closes [#1462](https://github.com/amannn/next-intl/issues/1462) – by @amannn

## 3.23.4 (2024-10-24)

### Bug Fixes

* Upgrade to `negotiator@^1.0` ([#1460](https://github.com/amannn/next-intl/issues/1460)) ([b93f297](https://github.com/amannn/next-intl/commit/b93f29736250a749333d438b06b7a608e9d73c28)) – by @amannn

## 3.23.3 (2024-10-24)

### Bug Fixes

* Resolve locale for navigation APIs consistently from `i18n/request.ts` in `react-server` like all other APIs do ([#1459](https://github.com/amannn/next-intl/issues/1459)) ([8c6d5ff](https://github.com/amannn/next-intl/commit/8c6d5fff009ac3c54b2847c23b8148759d0b6ffa)) – by @amannn

## 3.23.2 (2024-10-22)

### Bug Fixes

* Handle inlined search params and hashes correctly in `<Link />` from `createNavigation` ([#1448](https://github.com/amannn/next-intl/issues/1448)) ([ba0a537](https://github.com/amannn/next-intl/commit/ba0a537571b49d2d31cbc3c5079a7ad738e1409b)) – by @amannn

## 3.23.1 (2024-10-22)

### Bug Fixes

* Remove usage of deprecated `ReactNodeArray` which is removed in React 19 ([#1445](https://github.com/amannn/next-intl/issues/1445)) ([2396345](https://github.com/amannn/next-intl/commit/23963458e3ef3d5d29eeb9df01f40bbe11245301)) – by @amannn

## 3.23.0 (2024-10-22)

### Features

* Add Next.js 15 to peer dependencies ([#1443](https://github.com/amannn/next-intl/issues/1443)) ([4cb22bb](https://github.com/amannn/next-intl/commit/4cb22bb10990961dba7e5accd2b5c70664f2b6d2)) – by @amannn

## 3.22.0 (2024-10-21)

### Deprecations

- Deprecate `defaultTranslationValues` ([#1411](https://github.com/amannn/next-intl/pull/1411))

## 3.21.1 (2024-10-09)

### Bug Fixes

- Repair package publishing workflow (this release doesn't include any library changes) ([ceba9ae](https://github.com/amannn/next-intl/commit/ceba9ae92e863d7185c40054e8218e76a483f6a8)) – by @amannn

## 3.21.0 (2024-10-09)

### Features

- Add `t.has` to check whether a given message exists ([#1399](https://github.com/amannn/next-intl/issues/1399)) ([ee1a2a9](https://github.com/amannn/next-intl/commit/ee1a2a94b62474a5d8a1d39c8ff39bec072c02a0)) – by @tholander

## 3.20.0 (2024-09-24)

### Features

- Type-safe global `formats` ([#1346](https://github.com/amannn/next-intl/issues/1346)) ([b7aa14e](https://github.com/amannn/next-intl/commit/b7aa14e741e016aaaf40f67e9d2cd9ea194a029e)) – by @dBianchii

## 3.19.5 (2024-09-24)

### Bug Fixes

- Make all keys of `Formats` type optional for easier usage ([#1367](https://github.com/amannn/next-intl/issues/1367)) ([a7cbd9b](https://github.com/amannn/next-intl/commit/a7cbd9bb1d42aacb17e7a5500b7054c8bc76799b)) – by @amannn

## 3.19.4 (2024-09-19)

### Bug Fixes

- Handle malformed pathnames in middleware ([#1353](https://github.com/amannn/next-intl/issues/1353)) ([dcda9d9](https://github.com/amannn/next-intl/commit/dcda9d9c851046bd3032f6841b10831b50937ebb)), closes [#1351](https://github.com/amannn/next-intl/issues/1351) – by @amannn

## 3.19.3 (2024-09-17)

### Bug Fixes

- Handle overlapping locale prefixes correctly pt. 2 ([#1344](https://github.com/amannn/next-intl/issues/1344)) ([7958659](https://github.com/amannn/next-intl/commit/7958659f858bb5df19203ec3c1a8701e029ed2c4)) – by @amannn

## 3.19.2 (2024-09-17)

### Bug Fixes

- Handle overlapping custom locale prefixes correctly ([#1343](https://github.com/amannn/next-intl/issues/1343)) ([72c1731](https://github.com/amannn/next-intl/commit/72c1731892db6e7d0470cefcea2b1f22a5f37ce2)), closes [#1329](https://github.com/amannn/next-intl/issues/1329) – by @amannn

## 3.19.1 (2024-09-05)

### Bug Fixes

- Add error handling in case an invalid i18n request config file has been specified ([#1327](https://github.com/amannn/next-intl/issues/1327)) ([18b9fd6](https://github.com/amannn/next-intl/commit/18b9fd64af235c144cc0e5f4f166ba4df20fece4)) – by @amannn

## 3.19.0 (2024-08-30)

### Features

- Support `./i18n/request.ts` in addition to `./i18n.ts` ([#1308](https://github.com/amannn/next-intl/issues/1308)) ([258e95e](https://github.com/amannn/next-intl/commit/258e95ebef10033c3d6de524e6cd6c7459a18916)) – by @amannn

## 3.18.1 (2024-08-29)

### Bug Fixes

- Print warning for inconsistent i18n setup where no `locale` is read in `getRequestConfig` and also none is returned ([#1305](https://github.com/amannn/next-intl/issues/1305)) ([2f0f781](https://github.com/amannn/next-intl/commit/2f0f78142d32c2ffa32493c52f270eb4ed3f1a49)) – by @amannn

## 3.18.0 (2024-08-28)

### Features

- Add `defineRouting` for easier i18n routing setup ([#1299](https://github.com/amannn/next-intl/issues/1299)) ([5ff6120](https://github.com/amannn/next-intl/commit/5ff6120d5601e69dbeebd225e7a1416f3701ddc2)) – by @amannn

## 3.17.6 (2024-08-23)

### Bug Fixes

- Enable React Compiler ESLint plugin and fix relevant case ([#1281](https://github.com/amannn/next-intl/issues/1281)) ([606f4cc](https://github.com/amannn/next-intl/commit/606f4cc7bb821d685e3559dc674859fe13bb521a)), closes [/github.com/amannn/next-intl/pull/1281/files#diff-cc1535638f476a3c6bc0963bee2d96d868d36b3bfe54532f883bd68c8b6c7032](https://github.com/amannn//github.com/amannn/next-intl/pull/1281/files/issues/diff-cc1535638f476a3c6bc0963bee2d96d868d36b3bfe54532f883bd68c8b6c7032) [/github.com/amannn/next-intl/pull/1281/files#diff-77b8d7665f71fbfd5b235e11a40577295255c916dc2fa688c1538d3fa7aa85](https://github.com/amannn//github.com/amannn/next-intl/pull/1281/files/issues/diff-77b8d7665f71fbfd5b235e11a40577295255c916dc2fa688c1538d3fa7aa85) – by @amannn

## 3.17.5 (2024-08-23)

### Bug Fixes

- Lazy init message formatter for improved tree shaking in case `useTranslations` is only used in Server Components ([#1279](https://github.com/amannn/next-intl/issues/1279)) ([9f1725c](https://github.com/amannn/next-intl/commit/9f1725c20b8c542e46f197c2afa2b066e1293a7a)) – by @amannn

## 3.17.4 (2024-08-20)

### Bug Fixes

- Update `@formatjs/intl-localematcher` to latest version ([#1140](https://github.com/amannn/next-intl/issues/1140)) ([c217582](https://github.com/amannn/next-intl/commit/c217582cf47a3d0d65315e70eb9fd945efca7163)) – by @amannn

## 3.17.3 (2024-08-14)

### Bug Fixes

- Handle optional catch-all segments in navigation APIs if no value is provided and handle the case if a dynamic value appears multiple times in a pathname ([#1259](https://github.com/amannn/next-intl/issues/1259)) ([58ef482](https://github.com/amannn/next-intl/commit/58ef482eda383fc03a552a4f34b00c7b3136a4af)), closes [#1236](https://github.com/amannn/next-intl/issues/1236) – by @amannn

## 3.17.2 (2024-07-19)

### Bug Fixes

- Fix open redirect vulnerability for `localePrefix: 'as-necessary'` by sanitizing pathname in the middleware ([#1208](https://github.com/amannn/next-intl/issues/1208)) ([f42ac01](https://github.com/amannn/next-intl/commit/f42ac014c8a01124ab4eba46652a5224c5d7698e)), closes [#1207](https://github.com/amannn/next-intl/issues/1207) – by @hblee12294

## 3.17.1 (2024-07-15)

### Bug Fixes

- Apply `useMemo` for `useRouter` returned from `createLocalizedPathnamesNavigation` to keep a stable reference when possible ([#1201](https://github.com/amannn/next-intl/issues/1201)) ([a1b9a36](https://github.com/amannn/next-intl/commit/a1b9a3680b2a0d7f5b77f8571787ea8d66043852)), closes [#1198](https://github.com/amannn/next-intl/issues/1198) – by @amannn

## 3.17.0 (2024-07-12)

### Features

- Cache `Intl.*` constructors ([#1193](https://github.com/amannn/next-intl/issues/1193)) ([52c4f2c](https://github.com/amannn/next-intl/commit/52c4f2cede844c0ff3d2f73890dcfd75210bc1f2)), closes [#215](https://github.com/amannn/next-intl/issues/215) – by @amannn

## 3.16.0 (2024-07-11)

### Features

- Support `trailingSlash: true` in Next.js config ([#1190](https://github.com/amannn/next-intl/issues/1190)) ([cfbdee9](https://github.com/amannn/next-intl/commit/cfbdee990b367a968eca6258d5c2fcfe8ef2ff2d)) – by @amannn

## 3.15.5 (2024-07-09)

### Bug Fixes

- Support relative pathnames in `redirect` ([#1178](https://github.com/amannn/next-intl/issues/1178)) ([3b698d7](https://github.com/amannn/next-intl/commit/3b698d7abdb8859a43448381ba2361dee4b5e669)), closes [#1177](https://github.com/amannn/next-intl/issues/1177) – by @amannn

## 3.15.4 (2024-07-08)

### Bug Fixes

- Export `DomainsConfig` ([#1175](https://github.com/amannn/next-intl/issues/1175)) ([c4d1bb0](https://github.com/amannn/next-intl/commit/c4d1bb08e23cc8a726c3a52e6cee7b1c63cb4c8a)) – by @amannn

## 3.15.3 (2024-06-26)

### Bug Fixes

- Prefer more specific routes in `usePathname` when detecting the currently active pathname for localized pathnames ([#1152](https://github.com/amannn/next-intl/issues/1152)) ([936839e](https://github.com/amannn/next-intl/commit/936839e9508e447f3e60cc1f606258fd00e5227e)), closes [#1151](https://github.com/amannn/next-intl/issues/1151) – by @amannn

## 3.15.2 (2024-06-19)

**Note:** Version bump only for package use-intl

## 3.15.1 (2024-06-19)

### Bug Fixes

- Remove `@formatjs/ecma402-abstract` dependency in favor of the automatically bundled one from `intl-messageformat` ([#1141](https://github.com/amannn/next-intl/pull/1141)) – by [@amannn](https://github.com/amannn)

# 3.15.0 (2024-06-10)

### Features

- Add support for custom prefixes for i18n routing ([#1086](https://github.com/amannn/next-intl/issues/1086)) ([4ba921a](https://github.com/amannn/next-intl/commit/4ba921ac5c513d65c81343db3805c8e48da7c3f4))

## 3.14.1 (2024-05-23)

### Bug Fixes

- Handle external URLs passed to `redirect` and `permanentRedirect` ([#1084](https://github.com/amannn/next-intl/issues/1084) by [@mhogeveen](https://github.com/mhogeveen)) ([16b55e2](https://github.com/amannn/next-intl/commit/16b55e255cb70e76c07a9399205102ed4e26361d))

# 3.14.0 (2024-05-15)

### Features

- Support providing a locale in `i18n.ts` instead of reading it from the pathname ([#1017](https://github.com/amannn/next-intl/issues/1017)) ([5c968b2](https://github.com/amannn/next-intl/commit/5c968b22bc3520cabc31bc3d6648e4f527c3404a))

# 3.13.0 (2024-05-08)

### Features

- Support `numberingSystem` and `style` for relative time formatting ([#1057](https://github.com/amannn/next-intl/issues/1057)) ([14e3aa4](https://github.com/amannn/next-intl/commit/14e3aa4a4b04736ab8fcdcd50e6a57dd57bd08d7)), closes [#1056](https://github.com/amannn/next-intl/issues/1056)

## 3.12.2 (2024-05-03)

### Bug Fixes

- Print a warning in case the middleware didn't run on a request but APIs from `next-intl` are used ([#1045](https://github.com/amannn/next-intl/issues/1045)) ([8149955](https://github.com/amannn/next-intl/commit/814995511a81edf1d8c5ef843873fff003d2782e))

## 3.12.1 (2024-05-02)

### Bug Fixes

- Correctly parse date skeleton `EEEE` to a long weekday like "Tuesday" (upgrades to `intl-messageformat@10` internally) ([#1039](https://github.com/amannn/next-intl/issues/1039)) ([d6b5fd2](https://github.com/amannn/next-intl/commit/d6b5fd2d882b26a47c596a56d687039ffea1baac))

# 3.12.0 (2024-04-26)

### Features

- Automatically prefer localized pathnames that are more specific ([#983](https://github.com/amannn/next-intl/issues/983) by [@fkapsahili](https://github.com/fkapsahili)) ([88a9b7a](https://github.com/amannn/next-intl/commit/88a9b7a18e89c4c642c2dd486ad4cb8de24e0086))

## 3.11.3 (2024-04-17)

### Bug Fixes

- When using domain-based routing, use `defaultLocale` of a domain instead of the top-level one in case no other locale matches better on the domain ([#1000](https://github.com/amannn/next-intl/issues/1000)) ([42988b7](https://github.com/amannn/next-intl/commit/42988b773581dad7a09af0b5cd01c958afa60865)), closes [#998](https://github.com/amannn/next-intl/issues/998)

## 3.11.2 (2024-04-17)

### Bug Fixes

- Correctly detect base path at the app root `/` when using a locale prefix strategy other than `always`. This ensures the locale cookie is set correctly. ([#999](https://github.com/amannn/next-intl/issues/999)) ([1ce5988](https://github.com/amannn/next-intl/commit/1ce598893281f9789046b639b39a55fe4cca34c7)), closes [#997](https://github.com/amannn/next-intl/issues/997)

## 3.11.1 (2024-04-05)

### Bug Fixes

- Apply correct port when redirecting to another domain and the app doesn't run behind a proxy ([#979](https://github.com/amannn/next-intl/issues/979) by [@awkaiser-tr](https://github.com/awkaiser-tr)) ([485f59e](https://github.com/amannn/next-intl/commit/485f59e2c09224bf260e87ede30a67d0a5c542c0)), closes [#658](https://github.com/amannn/next-intl/issues/658)

# 3.11.0 (2024-04-03)

### Features

- Support symbols in localized pathnames that require URL encoding ([#959](https://github.com/amannn/next-intl/issues/959)) ([b6e66f4](https://github.com/amannn/next-intl/commit/b6e66f4afd663ea5dc0851f5b528bcc55388b927)), closes [#607](https://github.com/amannn/next-intl/issues/607) [/github.com/amannn/next-intl/issues/607#issuecomment-1979747515](https://github.com//github.com/amannn/next-intl/issues/607/issues/issuecomment-1979747515)

# 3.10.0 (2024-03-25)

### Features

- When using localized pathnames, allow access to internal pathnames only if they match an entry from a particular locale—otherwise redirect ([#914](https://github.com/amannn/next-intl/issues/914)) ([0658600](https://github.com/amannn/next-intl/commit/0658600ee323350dfeb2d616c38f6737674e76da))

## 3.9.5 (2024-03-15)

### Bug Fixes

- Improve support for older browsers by switching from `replaceAll` to `replace` ([#885](https://github.com/amannn/next-intl/issues/885) by @MichalMoravik) ([080333a](https://github.com/amannn/next-intl/commit/080333aa8ec2e4e41dc740e370032ee429b190f0)), closes [#884](https://github.com/amannn/next-intl/issues/884)

## 3.9.4 (2024-03-08)

### Bug Fixes

- Handle changing href for `<Link />` correctly when using `localePrefix: 'never'` ([#926](https://github.com/amannn/next-intl/issues/926)) ([b609dc0](https://github.com/amannn/next-intl/commit/b609dc05b31832af04ee57b73133568e43b69d1f)), closes [#918](https://github.com/amannn/next-intl/issues/918)

## 3.9.3 (2024-03-07)

### Bug Fixes

- Handle optional params in catch-all segments correctly when using localized pathnames ([#925](https://github.com/amannn/next-intl/issues/925)) ([8ba8b69](https://github.com/amannn/next-intl/commit/8ba8b699b5343a816f725d329fdb1153fa647b99)), closes [#917](https://github.com/amannn/next-intl/issues/917)

## 3.9.2 (2024-03-05)

### Bug Fixes

- Incorporate `basePath` correctly in `useRouter` functions ([#906](https://github.com/amannn/next-intl/issues/906)) ([4abcbeb](https://github.com/amannn/next-intl/commit/4abcbebdd603a18d9f1173709c174a8ac4210e37)), closes [#905](https://github.com/amannn/next-intl/issues/905) [#910](https://github.com/amannn/next-intl/issues/910)

## 3.9.1 (2024-02-23)

### Bug Fixes

- Return `now` from global context if no `updateInterval` has been set on `useNow` ([#881](https://github.com/amannn/next-intl/issues/881)) ([dbbefcf](https://github.com/amannn/next-intl/commit/dbbefcf145dfc8a924fbf685da87e276c8bb4d10))

# 3.9.0 (2024-02-20)

### Features

- Add redirects for case mismatches in locale prefixes (e.g. `/EN` → `/en`) ([#861](https://github.com/amannn/next-intl/issues/861)) ([3b2b446](https://github.com/amannn/next-intl/commit/3b2b446a241ce2cd402181afb0398565ac4a2492))

# 3.8.0 (2024-02-19)

### Features

- Add `format.dateTimeRange` ([#769](https://github.com/amannn/next-intl/issues/769) by [@martinmunillas](https://github.com/martinmunillas)) ([9f12521](https://github.com/amannn/next-intl/commit/9f12521edecf1aeff40a49ce0c133c19bafa7cf5))

# 3.7.0 (2024-02-09)

### Features

- Add support for `permanentRedirect`in navigation APIs ([#850](https://github.com/amannn/next-intl/issues/850) by [@polvallverdu](https://github.com/polvallverdu)) ([6508ddc](https://github.com/amannn/next-intl/commit/6508ddc35ecc95f6dce8b95ecde2734a169579b8))

# 3.6.0 (2024-02-08)

### Features

- Support formatting of React elements via `format.list(…)`. ([#845](https://github.com/amannn/next-intl/issues/845)) ([7bf11d4](https://github.com/amannn/next-intl/commit/7bf11d42b26c66bcecaf69627e6bd1925d8ba49d))

## 3.5.4 (2024-02-01)

### Bug Fixes

- Keep cookie value in sync when navigating within a locale ([#828](https://github.com/amannn/next-intl/issues/828)) ([1167523](https://github.com/amannn/next-intl/commit/1167523f01ed6363c3fe3bbb7aa925744eedd055)), closes [#826](https://github.com/amannn/next-intl/issues/826)

## 3.5.3 (2024-01-29)

### Bug Fixes

- Improve RSC render performance by sharing a cache between `getTranslations` and `useTranslations` ([#798](https://github.com/amannn/next-intl/issues/798) by [@fkapsahili](https://github.com/fkapsahili)) ([73e8337](https://github.com/amannn/next-intl/commit/73e8337044a8cb187d6f96f9b5ea77f6252866bb))

## 3.5.2 (2024-01-25)

### Bug Fixes

- Set cookie to `SameSite: Lax` ([#817](https://github.com/amannn/next-intl/issues/817)) ([0e91e64](https://github.com/amannn/next-intl/commit/0e91e64412f919f70533c9d6189073780a5baae8)), closes [#527](https://github.com/amannn/next-intl/issues/527) [#811](https://github.com/amannn/next-intl/issues/811)

## 3.5.1 (2024-01-23)

### Bug Fixes

- Remove `x-default` alternate links entry for non-root pathnames when using `localePrefix: 'always'` ([#805](https://github.com/amannn/next-intl/issues/805)) ([c5bb0f5](https://github.com/amannn/next-intl/commit/c5bb0f50efbb5321181439c6d9e9aee08226b46a))

# 3.5.0 (2024-01-22)

### Features

- Make options for `createSharedPathnamesNavigation` along with `locales` argument optional (relevant when `locales` aren't known statically) ([#784](https://github.com/amannn/next-intl/issues/784)) ([614053d](https://github.com/amannn/next-intl/commit/614053ddb40f83f7f4a122e5ffeb836d1ecbf63e))

## 3.4.5 (2024-01-19)

### Bug Fixes

- Make sure cookie value stays up to date when the Next.js Router Cache is used ([#790](https://github.com/amannn/next-intl/issues/790)) ([977b973](https://github.com/amannn/next-intl/commit/977b9732aa7b0a9cb0c26e8cf34ae30cc96f25b6)), closes [#786](https://github.com/amannn/next-intl/issues/786) [#786](https://github.com/amannn/next-intl/issues/786)

## 3.4.4 (2024-01-17)

### Bug Fixes

- Improve error message for missing messages by including the locale ([#782](https://github.com/amannn/next-intl/issues/782)) ([79eee9d](https://github.com/amannn/next-intl/commit/79eee9d0ca882b95d76007fed669b79c9b217d35))

## 3.4.3 (2024-01-16)

### Bug Fixes

- Apply global `timeZone` when using date skeletons in messages (e.g. `Ordered on {orderDate, date, ::yyyyMd}`) ([#695](https://github.com/amannn/next-intl/issues/695)) ([8940192](https://github.com/amannn/next-intl/commit/8940192664ffe10f70a0526c1f4d6cbfc942faab)), closes [#693](https://github.com/amannn/next-intl/issues/693)

## 3.4.2 (2024-01-09)

### Bug Fixes

- Change `numeric` option from `auto` to `always` for `format.relativeTime` ([#765](https://github.com/amannn/next-intl/issues/765)) ([246d373](https://github.com/amannn/next-intl/commit/246d37320669c3525db03dc635b6cfcac8591b4a)), closes [#757](https://github.com/amannn/next-intl/issues/757)

## 3.4.1 (2024-01-03)

### Bug Fixes

- Fix ESM output of `use-intl` ([#754](https://github.com/amannn/next-intl/issues/754)) ([e73fb38](https://github.com/amannn/next-intl/commit/e73fb381c3f0eaeb15b3d9ab9aebc2c567c766ae))

# 3.4.0 (2023-12-21)

### Features

- Invoke `notFound()` when no locale was attached to the request and update docs to suggest validating the locale in `i18n.ts` ([#742](https://github.com/amannn/next-intl/issues/742)) ([e6d9878](https://github.com/amannn/next-intl/commit/e6d98787ad43aec50dcb6594353da83a958a81d1)), closes [#736](https://github.com/amannn/next-intl/issues/736) [#716](https://github.com/amannn/next-intl/issues/716) [/next-intl-docs.vercel.app/docs/usage/configuration#i18](https://github.com//next-intl-docs.vercel.app/docs/usage/configuration/issues/i18)

## 3.3.3 (2023-12-20)

### Bug Fixes

- Improve performance when calling hooks like `useTranslations` in Server Components by making sure we only suspend when i18n config is initially loaded and never for subsequent calls ([#741](https://github.com/amannn/next-intl/issues/741)) ([4185a72](https://github.com/amannn/next-intl/commit/4185a72525581dcd04f2646af00a0e330f8e02e0))

## 3.3.2 (2023-12-11)

### Bug Fixes

- Fix types for passing a custom `type` to `redirect` ([#714](https://github.com/amannn/next-intl/issues/714)) ([db65cb7](https://github.com/amannn/next-intl/commit/db65cb7737a605bd8f2c69bf1b28cd076bf40fcf)), closes [#709](https://github.com/amannn/next-intl/issues/709)

## 3.3.1 (2023-12-07)

### Bug Fixes

- Improve error message when encountering a missing message in production ([#706](https://github.com/amannn/next-intl/issues/706)) ([515891b](https://github.com/amannn/next-intl/commit/515891b539c723778d2a5a2e6c0186bb6f916071))

# 3.3.0 (2023-12-06)

### Features

- Add support for `basePath` in middleware and navigation APIs ([#699](https://github.com/amannn/next-intl/issues/699) by @Robjam and [@amannn](https://github.com/amannn)) ([f670f1b](https://github.com/amannn/next-intl/commit/f670f1b37d803c7fbb6fbaa1c8d10f88cf141a84))

## 3.2.5 (2023-12-06)

### Bug Fixes

- Correctly normalize pathname for redirects and alternate links when `localePrefix: 'as-needed'` is used with the default locale ([#698](https://github.com/amannn/next-intl/issues/698) by [@anna-colenso](https://github.com/anna-colenso)) ([48e9523](https://github.com/amannn/next-intl/commit/48e9523863b99b363f63f0aa991c72860d814d7e))

## 3.2.4 (2023-12-05)

### Bug Fixes

- Fix compatibility with `moduleResolution: 'Bundler'` ([#694](https://github.com/amannn/next-intl/issues/694)) ([f7425a5](https://github.com/amannn/next-intl/commit/f7425a54a1d35235ec84d2937006d43152cbbe16)), closes [#690](https://github.com/amannn/next-intl/issues/690)

## 3.2.3 (2023-12-05)

### Bug Fixes

- Prefer `locale` from `NextIntlClientProvider` when using `useLocale` in Client Components. `useParams().locale` is still used as a fallback. ([#691](https://github.com/amannn/next-intl/issues/691)) ([e00ed97](https://github.com/amannn/next-intl/commit/e00ed97746dc8d6c264b2f4aa9162681c1a89919)), closes [#688](https://github.com/amannn/next-intl/issues/688)

## 3.2.2 (2023-12-04)

### Bug Fixes

- Allow to call `getRequestConfig` in outer module closure in a Client Component module graph ([#687](https://github.com/amannn/next-intl/issues/687)) ([0f16f10](https://github.com/amannn/next-intl/commit/0f16f106a68a2a443eb0ec3671084d40bf466d2f)), closes [#685](https://github.com/amannn/next-intl/issues/685)

## 3.2.1 (2023-12-01)

### Bug Fixes

- Allow to import `next-intl/server` into Client Components (however not call any functions). This allows for easier testing of page components with multiple exports. ([#683](https://github.com/amannn/next-intl/issues/683)) ([5ca4075](https://github.com/amannn/next-intl/commit/5ca4075e58c152e898e9048f3002c11c7aef2dd9)), closes [#681](https://github.com/amannn/next-intl/issues/681)

# 3.2.0 (2023-11-29)

### Features

- Add `localePrefix` for navigation APIs for an improved initial render of `Link` when using `localePrefix: never`. Also fix edge case in middleware when using localized pathnames for redirects that remove a locale prefix (fixes an infinite loop). ([#678](https://github.com/amannn/next-intl/issues/678)) ([1c68e3b](https://github.com/amannn/next-intl/commit/1c68e3b549e2029cbae62d549f609e1d76ca6490)), closes [#444](https://github.com/amannn/next-intl/issues/444)

## 3.1.4 (2023-11-24)

### Bug Fixes

- Apply correct port and protocol during domain-based redirects when called from an internal address (e.g. from a proxy) ([#662](https://github.com/amannn/next-intl/issues/662)) ([2bb867d](https://github.com/amannn/next-intl/commit/2bb867d1747123763a4e0144a99236ca3a8bc884)), closes [#658](https://github.com/amannn/next-intl/issues/658)

## 3.1.3 (2023-11-22)

### Bug Fixes

- Don't set cookie on response if `localeDetection: false` ([#654](https://github.com/amannn/next-intl/issues/654)) ([e85149c](https://github.com/amannn/next-intl/commit/e85149cb27d9e036dda1712a03a152d5fe241986)), closes [#609](https://github.com/amannn/next-intl/issues/609)

## 3.1.2 (2023-11-20)

### Bug Fixes

- Update link to migration example in error messages ([#648](https://github.com/amannn/next-intl/issues/648) by [@outloudvi](https://github.com/outloudvi)) ([1f3b226](https://github.com/amannn/next-intl/commit/1f3b22672938dbc8421c918ed11438eca5436a32))

## 3.1.1 (2023-11-20)

**Note:** Version bump only for package use-intl

# 3.1.0 (2023-11-17)

### Features

- Experimental support for `--turbo` (requires `next@^14.0.3`) ([#641](https://github.com/amannn/next-intl/issues/641)) ([46c6ec7](https://github.com/amannn/next-intl/commit/46c6ec751651ac6d827fec6544a26d3abd5bb70a)), closes [#250](https://github.com/amannn/next-intl/issues/250)

## 3.0.3 (2023-11-15)

### Bug Fixes

- Don't retrieve defaults for `locale`, `now` and `timeZone` if these options have been provided to `NextIntlClientProvider` ([#633](https://github.com/amannn/next-intl/issues/633)) ([824363a](https://github.com/amannn/next-intl/commit/824363a97d4cc735cb627349e7e16c80fd22b25a)), closes [#631](https://github.com/amannn/next-intl/issues/631)

## 3.0.2 (2023-11-15)

### Bug Fixes

- Allow usage of `getTranslations({namespace})` without TypeScript integration for messages ([#630](https://github.com/amannn/next-intl/issues/630)) ([62cf29c](https://github.com/amannn/next-intl/commit/62cf29c978863cf65f62e34f739775901f0f6d8a)), closes [#625](https://github.com/amannn/next-intl/issues/625)

## 3.0.1 (2023-11-14)

Add provenance statement to published packages.

# 3.0.0 (2023-11-14)

Please refer to [the release notes](https://next-intl-docs.vercel.app/blog/next-intl-3-0).

## 2.22.1 (2023-11-02)

### Bug Fixes

- Correct version range ([ffbff8e](https://github.com/amannn/next-intl/commit/ffbff8ef6c028f61bf6d239dbc232e4a86cb452a))

# 2.22.0 (2023-11-02)

### Features

- Support Next.js 14 ([#593](https://github.com/amannn/next-intl/issues/593)) ([5c449f5](https://github.com/amannn/next-intl/commit/5c449f565f4ef3587555865d86775dd9c06b8a4d))

# 2.21.0 (2023-10-18)

### Features

- Support custom units in `format.relativeTime` ([#566](https://github.com/amannn/next-intl/issues/566)) ([6e1bc35](https://github.com/amannn/next-intl/commit/6e1bc35388ccae9f594be6b2d3078a56a10b0a76))

## 2.20.2 (2023-09-22)

### Bug Fixes

- Add error reporting when no `timeZone` is specified and downgrade error handling for missing `now` value from throwing to reporting an error ([#519](https://github.com/amannn/next-intl/issues/519)) ([dc55ab2](https://github.com/amannn/next-intl/commit/dc55ab24bcf4c8e84316fa044736f93d56d1a41d))

## 2.20.1 (2023-09-21)

### Bug Fixes

- Use correct port for alternate links when running behind a proxy ([#514](https://github.com/amannn/next-intl/issues/514) by [@iza-w](https://github.com/iza-w)) ([747ad5b](https://github.com/amannn/next-intl/commit/747ad5b38301499e8857be6eae6540257623752c))

# 2.20.0 (2023-08-23)

### Features

- Improve runtime performance of `useTranslations` by avoiding the creation of message format instances if possible and introducing a cross-component message format cache ([#475](https://github.com/amannn/next-intl/issues/475)) ([4d177f8](https://github.com/amannn/next-intl/commit/4d177f8a27eada4f056b79b77797b384a08111e5)), closes [#294](https://github.com/amannn/next-intl/issues/294)

## 2.19.4 (2023-08-23)

### Bug Fixes

- Allow to import `next-intl/link` into Server Components without having to add a wrapping Client Component ([#465](https://github.com/amannn/next-intl/issues/465)) ([21a0691](https://github.com/amannn/next-intl/commit/21a06913055028848d36474fe636a4e3e332f647))

## 2.19.3 (2023-08-23)

### Bug Fixes

- Apply time zone for built-in default formats (`full`, `long`, `medium`, `short`) ([#473](https://github.com/amannn/next-intl/issues/473)) ([244b9b2](https://github.com/amannn/next-intl/commit/244b9b2adf003d80d47a2d84b72a2ef77d32950f)), closes [#467](https://github.com/amannn/next-intl/issues/467)

## 2.19.2 (2023-08-22)

### Bug Fixes

- Use correct host and protocol for alternate links when running behind a proxy (`x-forwarded-host`, `x-forwarded-proto`) ([#462](https://github.com/amannn/next-intl/issues/462) by @HHongSeungWoo) ([747cf8e](https://github.com/amannn/next-intl/commit/747cf8ef71a2e27a39c2178353eb31cfda8170f2))

## 2.19.1 (2023-08-01)

### Bug Fixes

- Handle case where the `locale` param is an array and set cookie expiration to one year ([#435](https://github.com/amannn/next-intl/issues/435)) ([82e842c](https://github.com/amannn/next-intl/commit/82e842ce742106bf350246316855bd053f4cdac7))

# 2.19.0 (2023-07-18)

### Features

- Add `localePrefix: 'never'` option for middleware ([#388](https://github.com/amannn/next-intl/issues/388) by [@boris-arkenaar](https://github.com/boris-arkenaar)) ([92ec33a](https://github.com/amannn/next-intl/commit/92ec33a8c47929f0ef0902d60bd1f55b64b2cf91)), closes [#366](https://github.com/amannn/next-intl/issues/366)

# 2.18.0 (2023-07-17)

### Features

- Accept `locale` with `useRouter` APIs ([#409](https://github.com/amannn/next-intl/issues/409)) ([0fbb3c7](https://github.com/amannn/next-intl/commit/0fbb3c7cc9945eff40fe84ef433da172b909a8e6)), closes [#408](https://github.com/amannn/next-intl/issues/408) [#407](https://github.com/amannn/next-intl/issues/407) [#320](https://github.com/amannn/next-intl/issues/320)

## 2.17.5 (2023-07-07)

### Bug Fixes

- Use ESM build only for browser bundlers (not Node.js) ([#386](https://github.com/amannn/next-intl/issues/386)) ([34a69f2](https://github.com/amannn/next-intl/commit/34a69f29cf07032c8a02aaf2b94e7e60d3f35088))

## 2.17.4 (2023-07-05)

### Bug Fixes

- Bring back ESM build (and fix bundle size) ([#381](https://github.com/amannn/next-intl/issues/381)) ([4d0fefc](https://github.com/amannn/next-intl/commit/4d0fefcb558bcee6037dce7bd8cebe727257c8ca))

## 2.17.3 (2023-07-05)

### Bug Fixes

- Forward optional remaining args from Next.js router to wrapped `useRouter` ([3ff878c](https://github.com/amannn/next-intl/commit/3ff878c380d998171fbc777df1951d1c817ab9ad))

## 2.17.2 (2023-07-05)

### Bug Fixes

- Remove ESM build ([#379](https://github.com/amannn/next-intl/issues/379)) ([22d9f27](https://github.com/amannn/next-intl/commit/22d9f272a06b99b1d1f9f3079b44067b8349102b))

## 2.17.1 (2023-07-04)

### Bug Fixes

- Switch to `tsup` for more efficient bundling and also switch to `vitest` internally ([#375](https://github.com/amannn/next-intl/issues/375)) ([bf31626](https://github.com/amannn/next-intl/commit/bf31626046bbf5829c34b8b8fc31f5d47a2ab26e))

# 2.17.0 (2023-06-29)

### Features

- Add autocomplete support for `timeZone` ([#359](https://github.com/amannn/next-intl/issues/359) by @A7med3bdulBaset) ([630dfc2](https://github.com/amannn/next-intl/commit/630dfc282c1eb2c1fca7a4bce4eb172ff7c03087))

# 2.16.0 (2023-06-29)

### Features

- Add `useMessages` for convenience and restructure docs to be App Router-first ([#345](https://github.com/amannn/next-intl/issues/345)) ([0dedbfd](https://github.com/amannn/next-intl/commit/0dedbfd10411796c7a290f172ad03f406c7cccec))

## 2.15.1 (2023-06-21)

### Bug Fixes

- Allow usage of `next-intl/link` and `usePathname` outside of Next.js ([#338](https://github.com/amannn/next-intl/issues/338)) ([6e1a56c](https://github.com/amannn/next-intl/commit/6e1a56c8c7b708b578033b41c31436a4dde32afc)), closes [#337](https://github.com/amannn/next-intl/issues/337)

# 2.15.0 (2023-06-20)

### Features

- Add `format.list(…)` for formatting conjunctions and disjunctions ([#327](https://github.com/amannn/next-intl/issues/327) by [@stefanprobst](https://github.com/stefanprobst)) ([32cda32](https://github.com/amannn/next-intl/commit/32cda32f47112915bb2032f3f9cc02bf3a4e833b))

## 2.14.6 (2023-05-22)

**Note:** Version bump only for package use-intl

## 2.14.5 (2023-05-22)

### Bug Fixes

- Set `SameSite` attribute for locale cookie to `strict` ([#302](https://github.com/amannn/next-intl/issues/302)) ([0a6bce5](https://github.com/amannn/next-intl/commit/0a6bce5d57733487b99a7da5037c6195b9d2779b)), closes [#301](https://github.com/amannn/next-intl/issues/301)

## 2.14.3 (2023-05-22)

### Bug Fixes

- Accept `ref` for `next-intl/link` ([#300](https://github.com/amannn/next-intl/issues/300)) ([4d7cc17](https://github.com/amannn/next-intl/commit/4d7cc17de723c23fff81e2d77623f734a7cc9363)), closes [#299](https://github.com/amannn/next-intl/issues/299)

## 2.14.2 (2023-05-12)

### Bug Fixes

- Fix forwarding of request headers in middleware ([#269](https://github.com/amannn/next-intl/issues/269) by @ARochniak) ([4ecbab5](https://github.com/amannn/next-intl/commit/4ecbab55c53d88a287a11237eea80bd66233f8c1)), closes [#266](https://github.com/amannn/next-intl/issues/266)

## 2.14.1 (2023-05-11)

### Bug Fixes

- Fix support for older Next.js versions by moving `Link` to `next-intl/link` ([#288](https://github.com/amannn/next-intl/issues/288)) ([f26ef99](https://github.com/amannn/next-intl/commit/f26ef999bf92c142d56d0009259e5a224c5dec5b)), closes [#287](https://github.com/amannn/next-intl/issues/287)

# 2.14.0 (2023-05-10)

### Features

- Add navigation APIs for App Router (`useRouter`, `usePathname` and `Link`) ([#282](https://github.com/amannn/next-intl/issues/282)) ([e30a89b](https://github.com/amannn/next-intl/commit/e30a89b7079d31cfdefdd1a2d0c0a750adf3a6ce))

## 2.13.4 (2023-05-05)

**Note:** Version bump only for package use-intl

## 2.13.3 (2023-05-05)

**Note:** Version bump only for package use-intl

## 2.13.2 (2023-05-03)

### Bug Fixes

- Improve warning for invalid namespace characters ([7435335](https://github.com/amannn/next-intl/tree/main/packages/use-intl/commit/74353356a799de8b7505aa378b91c3d63febd073))

## 2.13.1 (2023-04-14)

### Bug Fixes

- Improve error message when trying to render an array as a message ([#244](https://github.com/amannn/next-intl/tree/main/packages/use-intl/issues/244)) ([c6a4f7a](https://github.com/amannn/next-intl/tree/main/packages/use-intl/commit/c6a4f7a338d0b2cf7be545cb5203949679c187fc))

# 2.13.0 (2023-04-12)

### Features

- Sync improvements from RSC branch to main ([#238](https://github.com/amannn/next-intl/tree/main/packages/use-intl/issues/238)) ([1d12ba2](https://github.com/amannn/next-intl/tree/main/packages/use-intl/commit/1d12ba219afdbca77663c9d20f18db746de033fd)), closes [#149](https://github.com/amannn/next-intl/tree/main/packages/use-intl/issues/149) [#237](https://github.com/amannn/next-intl/tree/main/packages/use-intl/issues/237)

# 2.12.0 (2023-03-25)

### Features

- Add `BigInt` support for `useFormatter.format()` by [@tacomanator](https://github.com/tacomanator) ([#222](https://github.com/amannn/next-intl/tree/main/packages/use-intl/issues/222)) ([a5ded6c](https://github.com/amannn/next-intl/tree/main/packages/use-intl/commit/a5ded6c4cd706d5361556865050c5948a4d78887))

# 2.11.0 (2023-03-06)

### Features

- Add `useFormatter` (replaces `useIntl`) ([#209](https://github.com/amannn/next-intl/tree/main/packages/use-intl/issues/209)) ([021b682](https://github.com/amannn/next-intl/tree/main/packages/use-intl/commit/021b682aa00063b040ccf1c927111780c1f0a710))

## 2.10.4 (2023-02-20)

### Bug Fixes

- Return up-to-date translations when messages change ([#199](https://github.com/amannn/next-intl/tree/main/packages/use-intl/issues/199)) ([78f39b4](https://github.com/amannn/next-intl/tree/main/packages/use-intl/commit/78f39b408933d6fcbb38d085704bfbe14065dc0a))

## 2.10.3 (2023-02-19)

**Note:** Version bump only for package use-intl

## 2.10.2 (2022-12-09)

### Bug Fixes

- Remove magic `__DEV__` global ([#151](https://github.com/amannn/next-intl/tree/main/packages/use-intl/issues/151)) ([7d5aa6a](https://github.com/amannn/next-intl/tree/main/packages/use-intl/commit/7d5aa6a8fda0189adc6440214270e07a5593d98f))

## 2.10.1 (2022-12-09)

**Note:** Version bump only for package use-intl

# 2.10.0 (2022-12-09)

### Features

- Add support for using `next-intl` in the `app` folder with Next.js 13 (see https://next-intl-docs.vercel.app/docs/next-13, [#144](https://github.com/amannn/next-intl/tree/main/packages/use-intl/issues/144)) ([18c94d6](https://github.com/amannn/next-intl/tree/main/packages/use-intl/commit/18c94d623a05afa7710fea83360f12f9811fb38d))

## 2.9.2 (2022-12-08)

**Note:** Version bump only for package use-intl

## 2.9.1 (2022-11-03)

**Note:** Version bump only for package use-intl

# 2.9.0 (2022-10-27)

### Features

- Next.js 13 compatibility ([#140](https://github.com/amannn/next-intl/tree/main/packages/use-intl/issues/140)) ([65326a0](https://github.com/amannn/next-intl/tree/main/packages/use-intl/commit/65326a0b47980f260df466a283a6e7a0aa5e1cd0)), closes [#139](https://github.com/amannn/next-intl/tree/main/packages/use-intl/issues/139)

# 2.8.0 (2022-10-18)

### Features

- Provide `createTranslator` and `createIntl` by extracting a React-agnostic core library. Thanks to David Brands from Marvia for sponsoring the work on this feature, participating in discussion and providing feedback! ([#137](https://github.com/amannn/next-intl/tree/main/packages/use-intl/issues/137)) ([91f7489](https://github.com/amannn/next-intl/tree/main/packages/use-intl/commit/91f748972008b8587553b48aa36c95d7348b4b0c))

## 2.7.6 (2022-09-22)

**Note:** Version bump only for package use-intl

## 2.7.5 (2022-08-30)

**Note:** Version bump only for package use-intl

## 2.7.4 (2022-05-30)

### Bug Fixes

- Adapt TypeScript validation to work with messages files that only have a single top-level namespace ([#115](https://github.com/amannn/next-intl/tree/main/packages/use-intl/issues/115)) ([cf0b83e](https://github.com/amannn/next-intl/tree/main/packages/use-intl/commit/cf0b83e3a591cfe87e17537c3ca0c7000cc70b1e))

## 2.7.3 (2022-05-20)

### Bug Fixes

- Add back the ability to render the provider without messages ([#113](https://github.com/amannn/next-intl/tree/main/packages/use-intl/issues/113)) ([8395822](https://github.com/amannn/next-intl/tree/main/packages/use-intl/commit/8395822fa17cd0a04b88f8edce3b20e5e613fc78))

## 2.7.2 (2022-05-10)

### Bug Fixes

- Enable tree-shaking ([#108](https://github.com/amannn/next-intl/tree/main/packages/use-intl/issues/108)) ([157b0e2](https://github.com/amannn/next-intl/tree/main/packages/use-intl/commit/157b0e28376055e7e34e86007c51d008c8e214aa))

## 2.7.1 (2022-04-28)

### Bug Fixes

- Allow null message values ([#110](https://github.com/amannn/next-intl/tree/main/packages/use-intl/issues/110)) ([14ae8ff](https://github.com/amannn/next-intl/tree/main/packages/use-intl/commit/14ae8ffdf1b295873f14081e2c3709d0f9bd2b9e))

# 2.7.0 (2022-04-28)

### Features

- Warn for invalid namespace keys ([#106](https://github.com/amannn/next-intl/tree/main/packages/use-intl/issues/106)) ([e86ab28](https://github.com/amannn/next-intl/tree/main/packages/use-intl/commit/e86ab28b9180b866ce1a0a9173355d4b686b7d07))

# 2.6.0 (2022-04-08)

### Features

- Support React 18 ([#98](https://github.com/amannn/next-intl/tree/main/packages/use-intl/issues/98)) ([38614eb](https://github.com/amannn/next-intl/tree/main/packages/use-intl/commit/38614eb9c6d6fb96704424d7f3ff8a67a24b789e))

# 2.5.0 (2022-04-01)

### Features

- Type safe messages ([#93](https://github.com/amannn/next-intl/tree/main/packages/use-intl/issues/93)) ([13b49b1](https://github.com/amannn/next-intl/tree/main/packages/use-intl/commit/13b49b138bc0ec3adbe661af6a70dfabfe7e86b0))

## 2.4.1 (2022-03-24)

### Bug Fixes

- Overwrite prerelease ([6caf5c4](https://github.com/amannn/next-intl/tree/main/packages/use-intl/commit/6caf5c48a35179f802503bc6580469187765c837))

# [2.4.0](https://github.com/amannn/next-intl/tree/main/packages/use-intl/compare/v2.3.5...v2.4.0) (2022-02-08)

### Features

- Default translation values ([#86](https://github.com/amannn/next-intl/tree/main/packages/use-intl/issues/86)) ([0ed5e70](https://github.com/amannn/next-intl/tree/main/packages/use-intl/commit/0ed5e70ffc57dcdb1b7b9270dbce9e8475b3f478))

## 2.3.5 (2022-01-19)

### Bug Fixes

- Support identical wrappers with identical text content in rich text ([#80](https://github.com/amannn/next-intl/tree/main/packages/use-intl/issues/80)) ([b35bb9f](https://github.com/amannn/next-intl/tree/main/packages/use-intl/commit/b35bb9ffc5fa56c6260b6b424be3cd875f199aef))

## 2.3.4 (2022-01-04)

### Bug Fixes

- Allow usage outside of Next.js (e.g. Jest and Storybook) ([#76](https://github.com/amannn/next-intl/tree/main/packages/use-intl/issues/76)) ([7c6925b](https://github.com/amannn/next-intl/tree/main/packages/use-intl/commit/7c6925b39338be95c1c940c67a1ae2f5e3f85cdd))

## 2.3.3 (2021-12-23)

**Note:** Version bump only for package use-intl

## 2.3.2 (2021-12-23)

**Note:** Version bump only for package use-intl

## 2.3.1 (2021-12-23)

**Note:** Version bump only for package use-intl

# 2.3.0 (2021-11-24)

### Features

- Add `useLocale` and `useTimeZone` ([#67](https://github.com/amannn/next-intl/tree/main/packages/use-intl/issues/67)) ([7833f4a](https://github.com/amannn/next-intl/tree/main/packages/use-intl/commit/7833f4adc1aadc937cbaa550a968ef6f7b4f5ee1))

## 2.2.1 (2021-11-23)

### Bug Fixes

- Clearer error message when no messages are provided ([#66](https://github.com/amannn/next-intl/tree/main/packages/use-intl/issues/66)) ([742729a](https://github.com/amannn/next-intl/tree/main/packages/use-intl/commit/742729aaddd63367efc2b79ef0cdf93545abdfb0))

# 2.2.0 (2021-11-02)

### Features

- TypeScript improvements: Use enum type for `style` of `NumberFormatOptions`, only allow passing React children to messages rendered with `t.rich` and update `tslib` ([#63](https://github.com/amannn/next-intl/tree/main/packages/use-intl/issues/63)) ([d73e935](https://github.com/amannn/next-intl/tree/main/packages/use-intl/commit/d73e9358bf13c87c0a653bd9fbed35e41548ff1d))

## 2.1.1 (2021-10-28)

**Note:** Version bump only for package use-intl

# 2.1.0 (2021-10-27)

### Features

- Support Next.js 12 ([#61](https://github.com/amannn/next-intl/tree/main/packages/use-intl/issues/61)) ([0391cc8](https://github.com/amannn/next-intl/tree/main/packages/use-intl/commit/0391cc85d3401bca9df29080a569957f6be93c85))

## 2.0.5 (2021-09-28)

**Note:** Version bump only for package use-intl

## 2.0.4 (2021-09-28)

**Note:** Version bump only for package use-intl

## 2.0.3 (2021-09-17)

**Note:** Version bump only for package use-intl

## 2.0.2 (2021-09-17)

### Bug Fixes

- Render correct messages when the namespace changes in `useTranslations` ([#58](https://github.com/amannn/next-intl/tree/main/packages/use-intl/issues/58)) ([b8f7dab](https://github.com/amannn/next-intl/tree/main/packages/use-intl/commit/b8f7dab0e3a213a91bdcd7929547cd01ba0b5f54))

## 2.0.1 (2021-09-04)

**Note:** Version bump only for package use-intl

# 2.0.0 (2021-08-26)

- feat!: Use a separate API for rich text formatting to avoid type casting in TypeScript #54 ([4c13a64](https://github.com/amannn/next-intl/tree/main/packages/use-intl/commit/4c13a644ce99992d9e57887afe35a09b8e3d6572)), closes [#54](https://github.com/amannn/next-intl/tree/main/packages/use-intl/issues/54)

### BREAKING CHANGES

- Instead of using the `t` function for formatting both regular messages and rich text, this function will only work for regular messages now. For rich text you can use `t.rich` instead now.

## 1.5.1 (2021-08-13)

### Bug Fixes

- Improve API for rendering raw messages and add docs ([#51](https://github.com/amannn/next-intl/tree/main/packages/use-intl/issues/51)) ([19f4a7e](https://github.com/amannn/next-intl/tree/main/packages/use-intl/commit/19f4a7e4e81e1cff78dc7e3f337dce69800be280))

# 1.5.0 (2021-08-10)

### Features

- Add flag to return raw messages ([#48](https://github.com/amannn/next-intl/tree/main/packages/use-intl/issues/48)) ([b34e19f](https://github.com/amannn/next-intl/tree/main/packages/use-intl/commit/b34e19ff618308b7d0c01e7969975215d96ff608))

## 1.4.7 (2021-08-02)

### Bug Fixes

- Adjust default for `onError` of the provider to log errors correctly ([#46](https://github.com/amannn/next-intl/tree/main/packages/use-intl/issues/46)) ([d0a1986](https://github.com/amannn/next-intl/tree/main/packages/use-intl/commit/d0a1986905e30acac40630e9ea6d099caad617fb))

## 1.4.6 (2021-08-02)

### Bug Fixes

- Use `timeZone` in translation function from `useTranslations` ([#45](https://github.com/amannn/next-intl/tree/main/packages/use-intl/issues/45)) ([ebf75f2](https://github.com/amannn/next-intl/tree/main/packages/use-intl/commit/ebf75f2add0ddc46f89768e9481bb16c56f94720))

## 1.4.5 (2021-07-26)

**Note:** Version bump only for package use-intl

## 1.4.4 (2021-07-08)

**Note:** Version bump only for package use-intl

## 1.4.3 (2021-07-08)

**Note:** Version bump only for package use-intl

## [1.4.2](https://github.com/amannn/next-intl/tree/main/packages/use-intl/compare/v1.4.1...v1.4.2) (2021-06-16)

### Bug Fixes

- Don't require `react-dom` as a peer dependency ([#39](https://github.com/amannn/next-intl/tree/main/packages/use-intl/issues/39)) ([39edfcd](https://github.com/amannn/next-intl/tree/main/packages/use-intl/commit/39edfcd9091e09570fc2152cda6a1e9ae5e7c210))

## 1.3.11 (2021-05-07)

**Note:** Version bump only for package use-intl

## 1.3.10 (2021-05-02)

**Note:** Version bump only for package use-intl

## 1.3.9 (2021-05-02)

**Note:** Version bump only for package use-intl

## 1.3.8 (2021-03-26)

**Note:** Version bump only for package use-intl

## 1.3.7 (2021-02-12)

**Note:** Version bump only for package use-intl

## 1.3.6 (2021-02-09)

**Note:** Version bump only for package use-intl

## 1.3.5 (2021-02-09)

**Note:** Version bump only for package use-intl

## 1.3.4 (2021-02-09)

**Note:** Version bump only for package use-intl

## [1.3.3](https://github.com/amannn/next-intl/tree/main/packages/use-intl/compare/v1.3.2...v1.3.3) (2021-02-09)

### Bug Fixes

- Update DateTimeFormatOptions ([#29](https://github.com/amannn/next-intl/tree/main/packages/use-intl/issues/29)) ([91a8f52](https://github.com/amannn/next-intl/tree/main/packages/use-intl/commit/91a8f5216a9ef2a0e76be6e3e8bd706f5c7496a3))

## Previous releases

See [next-intl changelog](https://github.com/amannn/next-intl/blob/main/CHANGELOG.md).
