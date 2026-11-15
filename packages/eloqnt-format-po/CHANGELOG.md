# @eloqnt/format-po

## 0.1.1

### Patch Changes

- 4b49621: References can carry an optional `column`, and PO files order messages that share a line by it, so their order no longer depends on the input order.
- Updated dependencies [4b49621]
  - @eloqnt/config@0.1.1

## 0.1.0

### Minor Changes

- 73ef929: Release as 0.1.0, so that a `^0.1.0` range picks up later 0.1.x releases.

### Patch Changes

- 73ef929: Depend on `@eloqnt/config` through a `^0.1.0` range, so a config patch release arrives without a release here.
- Updated dependencies [73ef929]
  - @eloqnt/config@0.1.0

## 0.0.6

### Patch Changes

- 9f98b5b: Publish under the MIT license, with a `LICENSE` file in the package.
- Updated dependencies [9f98b5b]
  - @eloqnt/config@0.0.3

## 0.0.5

### Patch Changes

- 8d5cc87: Throw a clear error when a PO file contains an empty `msgstr` but no source locale is known, instead of decoding the entry to an empty message.

## 0.0.4

### Patch Changes

- fc5d933: Preserve a PO file's reference style and header order on write: files that carry `path:line` references keep them, and an existing `Language` header stays where it is. New files still get path-only references.

## 0.0.3

### Patch Changes

- a60870e: Treat a blank catalog file as new, so it receives the current layout instead of being read as plain gettext.

## 0.0.2

### Patch Changes

- f75066f: Republish with the build output, which was missing from the initial release.
- Updated dependencies [f75066f]
  - @eloqnt/config@0.0.2

## 0.0.1

### Patch Changes

- 387596a: Initial release
- Updated dependencies [387596a]
  - @eloqnt/config@0.0.1
