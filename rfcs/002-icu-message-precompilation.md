# RFC: Ahead-of-time compilation of ICU messages

Start date: 2025-01-28

## Summary

This RFC proposes build-time precompilation of ICU messages using a new library called [`icu-minify`](../packages/icu-minify) to reduce bundle size and improve runtime performance.

This document describes the motivation, design decisions, and tradeoffs of this optimization.

**Table of contents:**

- [Motivation](#motivation)
- [Proposed solution](#proposed-solution)
- [Implementation](#implementation)
- [Tradeoffs](#tradeoffs)
- [Prior art](#prior-art)

## Motivation

Currently, `next-intl` uses `intl-messageformat` to parse and format ICU messages at runtime.

This has two downsides:

1. It adds approximately 15KB (minified + compressed) to the bundle for both the server and client
2. It affects runtime performance, as every message needs to be parsed before it can be formatted

Some mitigation strategies are already possible, like moving more (or all) of your message consumption to Server Components. Additionally, parse results are cached, but total blocking time on initial page load can still be affected.

## Proposed solution

### Overview

This RFC introduced ahead-of-time compilation of ICU messages with a new library called `icu-minify`.

This eliminates the need to bundle an ICU parser and moves the compilation to the build step. With this, we can effectively decrease total blocking time for apps that have sensitive performance requirements.

### Intermediate representation

Traditionally, while ahead-of-time compilation can decrease runtime work, it can come at the cost of increased bundle size due to ICU message ASTs being rather large.

As an alternative, some i18n libraries compile messages to functions that have a lower bundle footprint. The issue with this approach however is that functions can't be serialized across the RSC bridge when being passed to Client Components. A workaround can be to import these functions where necessary, but this defeats per-locale splitting of messages.

In contrast, `icu-minify` compiles messages to a minimal intermediate representation in plain JSON:

```json
"Hello {name}!"
```

```json
["Hello ", ["name"], "!"]
```

This comes with barely a size overhead and can be evaluated by a 650 bytes runtime counterpart that leverages native `Intl` APIs.

And while this approach scales up to very complex messages with `plural`, `select` and more, a common observation has been that the majority of app messages tend to be plain strings. For these, the intermediate representation doesn't come with any overhead at all (`"Welcome"` → `"Welcome"`).

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

(also server-only APIs like `getTranslations` and `getExtracted` are optimized)

## Implementation

### Architecture

Ahead-of-time compilation piggybacks on previously added infrastructure that was initially implemented for [`useExtracted`](../docs/usage/extraction.md).

It uses a Turbo- or Webpack loader that compiles imported messages during the build step of an app. Later, when `precompile` is set to `true`, `next-intl` will swap out the runtime compiler from its base library `use-intl` with an alternative that calls into the runtime of `icu-minify`.

```
┌────────────────────────────────────────────────────────────┐
│ Build Time (next-intl plugin)                              │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Catalog Loader                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ messages/en.json: {"hello": "Hello {name}!"}         │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                      │
│                     ▼                                      │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ icu-minify/compile                                    │ │
│  │ Compiles ICU → Compact JSON                           │ │
│  └──────────────────┬────────────────────────────────────┘ │
│                     │                                      │
│                     ▼                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Compiled catalog: {"hello": ["Hello ", ["name"]]}    │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ Runtime (use-intl)                                         │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ import formatMessage from 'use-intl/format-message'  │  │
│  │ (aliased to 'use-intl/format-message/format-only')   │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                      │
│                     ▼                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ icu-minify/format                                    │  │
│  │ Formats precompiled JSON → string/ReactNode          │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### Compiled format

The compiled format uses a compact array-based representation that:

- **Minifies well**: Largely avoids object properties in favor of arrays
- **Is plain JSON**: Can be serialized across the RSC bridge without issues
- **Is fast to traverse**: Direct access without parsing overhead

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

The [`t.raw`](https://next-intl.dev/docs/usage/translations#raw-messages) API will not work with precompiled messages. You'll encounter parse errors when you try to put anything else than ICU messages into your locale catalogs and also if you call `t.raw` on a precompiled message, you'd simply receive the intermediate representation instead of the raw message. This is because messages need to be parsed before we even know if you intend to call `t.raw` on them.

Historically, `t.raw` was added to support raw HTML content in your messages. However, time has shown that this is cumbersome for long-form content in practice anyway and that there are better alternatives:

1. **MDX for local content**: For content like imprint pages and similar, grouping your localized content into files like `content.en.mdx` and `content.es.mdx` is significantly easier to manage.
2. **CMS for remote content**: Content management systems typically ship with a portable format that allows to express rich text in an HTML-agnostic way, enabling you to use the same content also for mobile apps and more (see e.g. [Sanity's Portable Text](https://www.sanity.io/docs/developer-guides/presenting-block-text)).

The other use case that `t.raw` was traditionally (ab)used for, is to handle arrays of messages. The recommended pattern for this has always been to use individual messages for each string, see [arrays of messages](https://next-intl.dev/docs/usage/translations#arrays-of-messages) in the docs. This pattern additionally has the benefit of being [statically analyzable](https://next-intl.dev/docs/workflows/messages).

Related to this, the recently introduced [`useExtracted`](./001-message-extraction.md) API doesn't support `t.raw` either, since it doesn't fit into this paradigm in the first place.

Due to this, it's recommended to migrate to one of the mentioned alternatives if you'd like to benefit from ahead-of-time compilation. If you're heavily using `t.raw`, you can of course also decide to leave the optimization off for now.

Potentially in a future release, `t.raw` might be deprecated—this is still up for discussion.

### 2. Compilation of remote messages

Precompilation cannot be used automatically for messages loaded from a remote source at runtime.

When messages are loaded dynamically (e.g., from a TMS, CMS, API, or CDN), the catalog loader cannot precompile them during the build process. However, you can manually compile remote messages after fetching them by using `icu-minify/compile` in your `i18n/request.ts` file and then returning the result as your `messages`.

## Prior art

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

### Design choices in `icu-minify`

- **Numeric type constants**: More compact than using string type identifiers (e.g., `2` vs `"plural"`)
- **Distinct type constants for formats (4/5/6)**: More compact than e.g. `[name, 4, "number"]` since the subtype is encoded in the constant itself
- **No type constant for tags**: Tags are detected by `typeof node[1] !== 'number'` to save bytes per tag
- **No support for plural offsets**: Simplifies runtime and is rarely needed in practice
- **Zero runtime dependencies**: Uses native `Intl` APIs
