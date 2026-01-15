# RFC: ICU Message Precompilation

Start date: 2025-01-16

## Summary

This RFC proposes build-time precompilation of ICU messages using a new library called `icu-minify` to reduce bundle size and improve runtime performance.

This document describes the motivation, design decisions, and tradeoffs of this optimization. The core implementation is already available in [`icu-minify`](../packages/icu-minify).

→ [**Discussion**](https://github.com/amannn/next-intl/discussions/2209)

**Table of contents:**

- [Motivation](#motivation)
- [Proposed solution](#proposed-solution)
- [Implementation details](#implementation-details)
  - [Compiled format](#compiled-format)
  - [Build-time compilation](#build-time-compilation)
  - [Runtime formatting](#runtime-formatting)
  - [Integration with next-intl](#integration-with-next-intl)
- [Tradeoffs](#tradeoffs)
- [Migration](#migration)
- [Prior art & credits](#prior-art--credits)

## Motivation

Currently, `next-intl` uses `intl-messageformat` to parse and format ICU messages at runtime.

This has two downsides:

1. It adds approximately **15KB** (minified + compressed) to the bundle
2. It affects runtime performance, as every message needs to be parsed

(2) was mitigated with caching, but total blocking time on initial page load is still affected.

While Server Components helped to move more work to the server, there's still room for improvement.

## Proposed solution

### Overview

This RFC introduced ahead-of-time compilation of ICU messages with a new library called `icu-minify`.

This eliminates the need to bundle an ICU parser and moves the compilation step to the build step. With this, we can effectively decrease total blocking time for apps and sites that have sensitive performance requirements.

### Intermediate representation

Traditionally, while ahead-of-time compilation can decrease runtime work, it can come at the cost of increased bundle size due to ASTs being rather large.

As an alternative, some i18n libraries compile messages to functions that have a lower bundle footprint. The issue with this approach however is that functions can't be serialized across the RSC bridge when being passed to Client Components. A workaround can be to import these functions where necessary, but this however defeats per-locale splitting of messages.

In contrast, `icu-minify` compiles messages to a minimal intermediate representation in plain JSON:

```json
"Hello {name}!"
```

```json
["Hello ", ["name"], "!"]
```

This comes with barely any size overhead and can be evaluated by a 650 bytes runtime counterpart that leverages native `Intl` APIs.

And while this can scale up to very complex messages with `plural`, `select` and more, a common observation has been that the majority of app messages tend to be plain strings. For these, the intermediate representation doesn't come with any overhead at all (`"Welcome"` → `"Welcome"`).

### API

The public API of `next-intl` remains unchanged for end users and `icu-minify` is simply an implementation detail.

The optimization is enabled via a single flag that can be turned on globally:

```tsx
// next.config.ts
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin({
  messages: {
    path: './messages',
    locales: 'infer',
    format: 'json',

    // Enable precompilation
    precompile: true
  }
});

export default withNextIntl();
```

After enabling precompilation, both `useTranslations` and `useExtracted` can benefit from this:

```tsx
// ✅ Can be precompiled
const t = useTranslations();
t('hello', {name: 'World'});

// ✅ Precompiled as well
const t = useExtracted();
t('Hello {name}!', {name: 'World'});
```

## Implementation details

### Architecture

Ahead-of-time compilation piggybacks on previously added infrastructure that was initially implemented for [`useExtracted`](../docs/usage/extraction.md).

It uses a Turbo- or Webpack loader that compiles imported messages during the build step of an app. Later, when `precompile` is set to `true`, `next-intl` will swap out the runtime compiler from its base library `use-intl` with an alternative that calls into the runtime from `icu-minify`.

**Workflow:**

```
┌─────────────────────────────────────────────────────────────┐
│ Build Time (next-intl plugin)                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Catalog Loader                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ messages/en.json: {"hello": "Hello {name}!"}         │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│                     ▼                                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ icu-minify/compiler                                   │  │
│  │ Compiles ICU → Compact JSON                           │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│                     ▼                                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Compiled catalog: {"hello": ["Hello ", ["name"]]}   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Runtime (use-intl)                                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ import formatMessage from 'use-intl/format-message'   │  │
│  │ (aliased to format-only when precompile: true)      │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│                     ▼                                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ icu-minify/format                                     │  │
│  │ Formats precompiled JSON → string/ReactNode          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Compiled format

The compiled format uses a compact array-based representation that:

- **Minifies well**: Largely avoids object properties in favor of arrays
- **Is plain JSON**: Can be serialized across the RSC bridge without issues
- **Is fast to traverse**: Direct array/object access without parsing overhead

#### Type constants

```
POUND = 0
SELECT = 1
PLURAL = 2
SELECTORDINAL = 3
NUMBER = 4
DATE = 5
TIME = 6
```

Tags have no type constant—they're detected by checking if the second element is not a number.

#### Node types

| Node          | Format                     | Example                                        |
| ------------- | -------------------------- | ---------------------------------------------- |
| String        | `"text"`                   | `"Hello"`                                      |
| Pound sign    | `0`                        | `0` (represents `#` in plural)                 |
| Simple arg    | `["name"]`                 | `["name"]`                                     |
| Tag           | `["tagName", ...children]` | `["b", "bold"]`                                |
| Select        | `["name", 1, {options}]`   | `["gender", 1, {male: "He", other: "They"}]`   |
| Plural        | `["name", 2, {options}]`   | `["n", 2, {one: "item", other: "items"}]`      |
| Ordinal       | `["name", 3, {options}]`   | `["n", 3, {one: [0, "st"], other: [0, "th"]}]` |
| Number format | `["name", 4, style?]`      | `["val", 4, "percent"]`                        |
| Date format   | `["name", 5, style?]`      | `["d", 5, "short"]`                            |
| Time format   | `["name", 6, style?]`      | `["t", 6, "medium"]`                           |

#### Examples

| Input                                         | Compiled Output                                         |
| --------------------------------------------- | ------------------------------------------------------- |
| `"Hello world"`                               | `"Hello world"`                                         |
| `"Hello {name}"`                              | `["Hello ", ["name"]]`                                  |
| `"<b>bold</b>"`                               | `[["b", "bold"]]`                                       |
| `"<b>{name}</b>"`                             | `[["b", ["name"]]]`                                     |
| `"{n, plural, one {# item} other {# items}}"` | `[["n", 2, {one: [0, " item"], other: [0, " items"]}]]` |

## Tradeoffs

### 1. `t.raw` is not supported

The [`t.raw`](https://next-intl.dev/docs/usage/translations#raw-messages) API will not work with precompiled messages. Or rather, you'll encounter parse errors when you try to put anything else than ICU messages into your locale catalogs.

Historically, `t.raw` was added to support raw HTML content in your messages. However, time has shown that this is cumbersome for long-form content in practice and that there are better alternatives:

1. **MDX for local content**: For content like imprint pages and similar, grouping your localized content into files like `content.en.mdx` and `content.es.mdx` is significantly easier to manage.
2. **CMS for remote content**: Content management systems typically ship with a portable format that allows to express rich text in an HTML-agnostic way, enabling you to use the same content also for mobile apps and more ([example](https://www.sanity.io/docs/developer-guides/presenting-block-text)).

The other use case that `t.raw` was traditionally (ab)used for, is to handle arrays of messages. The recommended pattern for this has always been to use individual messages for each string, see [arrays of messages](https://next-intl.dev/docs/usage/translations#arrays-of-messages) in the docs.

Related to this, the recently introduced [`useExtracted`](./001-message-extraction.md) API also doesn't support `t.raw` either, since it doesn't fit into this paradigm in the first place.

Due to this, it's recommended to migrate to one of the mentioned alternatives if you'd like to benefit from ahead-of-time compilation. If you're heavily using `t.raw`, you can of course also decide to leave the optimization off for now.

Potentially in a future release, `t.raw` might be deprecated—this is still up for discussion.

### 2. Remote messages

**Impact**: Precompilation cannot be used automatically for messages loaded from a remote source.

When messages are loaded dynamically at runtime (e.g., from a TMS, CMS, API, or CDN), the catalog loader cannot precompile them during the build process. However, you can manually compile remote messages after fetching them by using `icu-minify/compiler` in your `i18n/request.ts` file.

## Prior art & credits

Ahead-of-time compilation was heavily inspired by [`icu-to-json`](https://github.com/jantimon/icu-to-json) by [Jan Nicklas](https://x.com/jantimon). I later also discovered [`@lingui/message-utils`](https://github.com/lingui/js-lingui/tree/main/packages/message-utils), which is another library that has explored this approach.

### Comparison

| Aspect        | icu-minify                         | icu-to-json                        | Lingui                   |
| ------------- | ---------------------------------- | ---------------------------------- | ------------------------ |
| Parser        | @formatjs/icu-messageformat-parser | @formatjs/icu-messageformat-parser | @messageformat/parser    |
| Simple arg    | `["name"]`                         | `["name"]`                         | `["name"]`               |
| Number format | `["n", 4]`                         | `["n", 4, "number"]`               | `["n", "number"]`        |
| Date format   | `["d", 5]`                         | `["d", 4, "date"]`                 | `["d", "date"]`          |
| Plural        | `["n", 2, {...}]`                  | `["n", 2, {...}]`                  | `["n", "plural", {...}]` |
| Select        | `["g", 1, {...}]`                  | `["g", 1, {...}]`                  | `["g", "select", {...}]` |
| Pound sign    | `0`                                | `0`                                | `"#"`                    |
| Tags          | `["b", child1, ...]`               | `["b", 5, child1, ...]`            | Not supported            |
| Plural offset | Not supported                      | Supported                          | Supported                |

**Design choices in `icu-minify`:**

- **Distinct type constants for formats (4/5/6)**: More compact than `[name, 4, "number"]` used by icu-to-json since the subtype is encoded in the constant itself
- **No TYPE constant for tags**: Tags are detected by `typeof node[1] !== 'number'`. Saves bytes per tag
- **Numeric type constants**: More compact than using string type identifiers (e.g., `"plural"` vs `2`)
- **No plural offset**: Simplifies runtime; rarely needed in practice
- **Zero runtime dependencies**: Uses native `Intl` APIs
