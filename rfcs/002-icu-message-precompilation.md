# RFC: ICU Message Precompilation

Start date: 2025-01-13

## Summary

This RFC proposes build-time precompilation of ICU messages using `icu-minify` to reduce bundle size and improve runtime performance. Instead of parsing and compiling ICU messages at runtime using `intl-messageformat` (~15KB), messages are precompiled to a compact JSON format at build time and formatted using a minimal runtime (~660 bytes).

This document describes the motivation, design decisions, and tradeoffs of this optimization. The core implementation is already available in `packages/icu-minify/`.

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

### Current state

Currently, `next-intl` uses `intl-messageformat` to parse and format ICU messages at runtime:

1. **Bundle size**: `intl-messageformat` adds approximately **15KB** (minified + compressed) to the bundle
2. **Runtime parsing**: Every message is parsed from its ICU string format into an AST on first use (with caching)
3. **Compilation overhead**: Messages are compiled into a format that can be formatted, which happens on every render for uncached messages

This approach works well and is flexible, but for applications with many messages or performance-sensitive use cases, the overhead can be significant. Server Components were a great step for moving more compilation work to the server, but there's still room for improvement.

### What's not ideal

1. **Bundle bloat**: The `intl-messageformat` library is included in client-side bundles when using `useTranslations` on the client side
2. **Redundant work**: Messages are parsed and compiled at runtime, even though they're more often than not static and known at build time

### Why this matters

- **Performance**: Eliminating runtime parsing reduces CPU work and improves FCP (for dynamic pages) and TTI (for apps with client-side usage of messages)
- **Bundle size**: Reducing the runtime from ~15KB to ~660 bytes saves significant space, especially for edge deployments or mobile apps

This optimization is particularly valuable for:

- Applications with many messages
- Performance-critical applications

## Proposed solution

### Overview

The solution introduces a two-phase approach:

1. **Build time**: Messages are compiled from ICU strings to a compact JSON format using `icu-minify/compiler`
2. **Runtime**: Messages are formatted using `icu-minify/format`, which directly traverses the precompiled structure

### API

The API remains unchanged for end users. The optimization is enabled via a configuration flag:

```tsx
// next.config.ts
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin({
  messages: {
    path: './messages',
    format: 'json',

    // Enable precompilation
    precompile: true
  }
});

export default withNextIntl();
```

This works with both `useTranslations` and `useExtracted`:

```tsx
// ✅ Can be precompiled
const t = useTranslations();
t('hello', {name: 'World'});

// ✅ Can be precompiled
const t = useExtracted();
t('Hello {name}!', {name: 'World'});
```

### Architecture

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

## Implementation details

### Compiled format

The compiled format uses a compact array-based representation that:

- **Minifies well**: Compresses efficiently with gzip/brotli due to repeated patterns
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

### Build-time Compilation

When `precompile: true` is enabled:

1. The catalog loader (`packages/next-intl/src/plugin/catalog/catalogLoader.tsx`) processes message catalogs
2. Each ICU message string is compiled using `icu-minify/compiler` to the compact JSON format
3. The compiled catalog is stored and loaded at runtime instead of raw ICU strings

The compiler:

- Uses `@formatjs/icu-messageformat-parser` to parse ICU strings (same parser as `intl-messageformat`)
- Converts the AST to the compact array format
- Handles all ICU features: arguments, plural, select, selectordinal, date, time, number, and tags

### Runtime formatting

The runtime formatter (`icu-minify/format`) is a minimal implementation that:

- **Directly traverses** the precompiled structure (no parsing needed)
- **Uses native Intl APIs**: `Intl.PluralRules`, `Intl.NumberFormat`, `Intl.DateTimeFormat`
- **Zero dependencies**: No external libraries required
- **~660 bytes**: Minimal bundle footprint (minified + compressed)

The formatter supports:

- All ICU message format features
- Rich text formatting (tags)
- Custom number/date/time formats
- TypeScript type safety

### Integration with next-intl

The integration uses a webpack/turbopack alias pattern:

1. **Default behavior**: `use-intl/format-message` exports the compile-and-format implementation (uses `intl-messageformat`)
2. **With precompile**: The alias redirects `use-intl/format-message` to `use-intl/format-message/format-only` (uses `icu-minify/format`)

This approach:

- Maintains backward compatibility: `use-intl` continues to work standalone
- Enables the optimization only when explicitly enabled in `next-intl`
- Requires no changes to user code

## Tradeoffs

### 1. `t.raw` not supported

**Impact**: The `t.raw` API will not work with precompiled messages.

`t.raw` currently returns the raw message value from the catalog without any processing. This is useful for:

- Raw HTML content that needs to be rendered with `dangerouslySetInnerHTML`
- Non-string message values (objects, arrays)
- Cases where you need the unprocessed message

With precompilation, messages are compiled to the array format, so `t.raw` would return the compiled structure rather than the original ICU string.

**Alternatives**:

1. **Use MDX for long-form content**: For content that needs to be raw (like blog posts, documentation), consider using MDX or a CMS instead of message catalogs
2. **Migrate to ICU-compatible code**: Convert raw HTML to ICU tags that can be processed normally:

   ```tsx
   // Instead of:
   t.raw('content'); // Returns: "<h1>Title</h1>"

   // Use:
   t.rich('content', {
     h1: (chunks) => <h1>{chunks}</h1>
   });
   ```

3. **Don't use precompilation**: If you use `t.raw` extensively, you can choose to leave precompilation off.

### 2. Remote messages

**Impact**: Precompilation cannot be used automatically for messages loaded from a remote source.

When messages are loaded dynamically at runtime (e.g., from a TMS, CMS, API, or CDN), the catalog loader cannot precompile them during the build process. These messages will continue to use the default `intl-messageformat` runtime.

**Workaround**: You can manually compile remote messages using `icu-minify/compiler` before passing them to `next-intl`.

## Prior art & credits

This RFC draws inspiration from these projects:

**[icu-to-json](https://github.com/jantimon/icu-to-json)**
**[@lingui/message-utils](https://github.com/lingui/js-lingui/tree/main/packages/message-utils)**

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

**Design choices in icu-minify:**

- **Distinct type constants for formats (4/5/6)**: More compact than `[name, 4, "number"]` used by icu-to-json since the subtype is encoded in the constant itself
- **No TYPE constant for tags**: Tags are detected by `typeof node[1] !== 'number'`. Saves bytes per tag
- **Numeric type constants**: More compact than Lingui's string types (`"plural"` vs `2`)
- **No plural offset**: Simplifies runtime; rarely needed in practice
- **Zero runtime dependencies**: Uses native Intl APIs (PluralRules, NumberFormat, DateTimeFormat)
