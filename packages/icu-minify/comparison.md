# Comparison: icu-minify vs icu-to-json

This document compares our `icu-minify` implementation with [jantimon/icu-to-json](https://github.com/jantimon/icu-to-json).

## Overview

Both libraries share the same core goal: compile ICU MessageFormat strings at build time into compact JSON for efficient runtime rendering.

| Aspect | icu-minify | icu-to-json |
|--------|-----------|-------------|
| Runtime size | ~1KB (brotli) | ~1KB (gzip) |
| Parser | @formatjs/icu-messageformat-parser | @formatjs/icu-messageformat-parser |
| Runtime dependencies | Zero (native Intl) | @messageformat/runtime |
| Status | New | v0.0.20 (early development) |

## JSON Format Comparison

Both use identical numeric type constants and produce identical JSON output:

```
SELECT=1, PLURAL=2, SELECTORDINAL=3, FORMAT/FN=4, TAG=5
```

### Examples

| Input | Output |
|-------|--------|
| `"Hello {name}"` | `["Hello ", ["name"]]` |
| `"<b>bold</b>"` | `[["b", 5, "bold"]]` |
| `"<b>Hello {name}</b>"` | `[["b", 5, "Hello ", ["name"]]]` |
| `"{count, plural, one {# item} other {# items}}"` | `[["count", 2, {one: [0, " item"], other: [0, " items"]}]]` |

## Key Differences

### 1. Runtime Dependencies

**icu-minify**: Zero runtime dependencies. Uses native `Intl.PluralRules`, `Intl.NumberFormat`, and `Intl.DateTimeFormat`.

**icu-to-json**: Depends on `@messageformat/runtime` for plural rule handling.

**Advantage**: icu-minify - smaller dependency footprint, more self-contained.

### 2. String Interpolation

**icu-to-json**: Offers an alternative `compileStringInterpolation()` for bracket notation like `"Hello [0]!"`.

**icu-minify**: Only supports standard ICU syntax.

**Advantage**: icu-to-json - more flexible for non-ICU use cases.

### 3. Argument Extraction

**icu-to-json**: The compiler returns both the compiled JSON and extracted argument metadata:
```typescript
{
  json: CompiledAst,
  arguments: { name: "string", count: "plural", ... }
}
```

**icu-minify**: Only returns compiled JSON.

**Advantage**: icu-to-json - argument metadata enables TypeScript type generation.

### 4. Type Generation

**icu-to-json**: CLI can generate TypeScript type definitions for messages and their required parameters.

**icu-minify**: No type generation feature.

**Advantage**: icu-to-json - better DX for TypeScript projects.

### 5. CLI

**icu-to-json**: Provides a CLI for batch compilation.

**icu-minify**: API-only (no CLI).

**Advantage**: icu-to-json - easier integration into build pipelines.

## Summary

Both implementations produce identical JSON output. The main differences are:

- **icu-minify** has zero runtime dependencies
- **icu-to-json** has better tooling (CLI, type generation, argument extraction)

The ideal solution would combine icu-minify's zero-dependency runtime with icu-to-json's developer experience features.
