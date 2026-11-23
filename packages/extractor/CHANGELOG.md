# @eloqnt/extractor

## 0.1.0

### Minor Changes

- Move the message extraction internals into the new `@eloqnt/messages` and `@eloqnt/extractor` packages, so next-intl and the eloqnt CLI share one implementation. No change in behavior. ([#2489](https://github.com/amannn/next-intl/pull/2489), [`cb1b77e`](https://github.com/amannn/next-intl/commit/cb1b77e218606450fcd219f0ad2a7cad994f1d73), [@amannn](https://github.com/amannn))

### Patch Changes

- Extract messages from `.mts`, `.cts`, `.mjs` and `.cjs` files, and parse `.ts` files without JSX so type assertions like `<string>value` and generic arrow functions no longer fail. ([#2487](https://github.com/amannn/next-intl/pull/2487), [`3be6ee1`](https://github.com/amannn/next-intl/commit/3be6ee1a543980e1f5f4bfcc2bc548551b8614cf), [@amannn](https://github.com/amannn))

- Fail `next build` and `unstable_extractMessages` with the file name when a source file can't be parsed, instead of writing messages files without that file's messages. During `next dev`, messages files stay unchanged until the file parses again. ([#2487](https://github.com/amannn/next-intl/pull/2487), [`3be6ee1`](https://github.com/amannn/next-intl/commit/3be6ee1a543980e1f5f4bfcc2bc548551b8614cf), [@amannn](https://github.com/amannn))
- Updated dependencies [[`cb1b77e`](https://github.com/amannn/next-intl/commit/cb1b77e218606450fcd219f0ad2a7cad994f1d73)]:
  - @eloqnt/messages@0.1.0
