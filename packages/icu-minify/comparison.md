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

Both use nearly identical numeric type constants:

```
icu-minify:     SELECT=1, PLURAL=2, SELECTORDINAL=3, FORMAT=4, TAG=5
icu-to-json:    SELECT=1, PLURAL=2, SELECTORDINAL=3, FN=4,     TAG=5
```

### Simple Argument
```
Input: "Hello {name}"

icu-minify:    ["Hello ", ["name"]]
icu-to-json:   ["Hello ", ["name"]]
```

### Plural
```
Input: "{count, plural, one {# item} other {# items}}"

icu-minify:    [["count", 2, {one: [0, " item"], other: [0, " items"]}]]
icu-to-json:   [["count", 2, {one: [0, " item"], other: [0, " items"]}]]
```

### Tags
```
Input: "<b>bold</b>"

icu-minify:    [["b", 5, ["bold"]]]
icu-to-json:   [["b", 5, "bold"]]      (children not wrapped)
```

## Key Differences

### 1. Runtime Dependencies

**icu-minify**: Zero runtime dependencies. Uses native `Intl.PluralRules`, `Intl.NumberFormat`, and `Intl.DateTimeFormat`.

**icu-to-json**: Depends on `@messageformat/runtime` for plural rule handling.

**Advantage**: icu-minify - smaller dependency footprint, more self-contained.

### 2. Tag Children Structure

**icu-minify**: Children are always wrapped in an array at position 2.
```typescript
[name, TYPE_TAG, Array<CompiledNode>]
```

**icu-to-json**: Children are spread directly as rest elements.
```typescript
[name, TYPE_TAG, ...children]
```

**Advantage**: icu-to-json - slightly smaller JSON output. However, icu-minify's approach is required for TypeScript's tuple type system to avoid circular reference errors.

### 3. String Interpolation

**icu-to-json**: Offers an alternative `compileStringInterpolation()` for bracket notation like `"Hello [0]!"`.

**icu-minify**: Only supports standard ICU syntax.

**Advantage**: icu-to-json - more flexible for non-ICU use cases.

### 4. Argument Extraction

**icu-to-json**: The compiler returns both the compiled JSON and extracted argument metadata:
```typescript
{
  json: CompiledAst,
  arguments: { name: "string", count: "plural", ... }
}
```

**icu-minify**: Only returns compiled JSON.

**Advantage**: icu-to-json - argument metadata enables TypeScript type generation.

### 5. Type Generation

**icu-to-json**: CLI can generate TypeScript type definitions for messages and their required parameters.

**icu-minify**: No type generation feature.

**Advantage**: icu-to-json - better DX for TypeScript projects.

### 6. CLI

**icu-to-json**: Provides a CLI for batch compilation.

**icu-minify**: API-only (no CLI).

**Advantage**: icu-to-json - easier integration into build pipelines.

## Potential Improvements for icu-minify

### High Priority

1. **Return argument metadata from compiler**

   Like icu-to-json, return extracted arguments with their types:
   ```typescript
   compile(message: string): {
     compiled: CompiledMessage;
     arguments: Record<string, 'string' | 'number' | 'date' | 'plural' | 'select' | 'tag'>;
   }
   ```
   This enables type generation and validation.

2. **Consider TypeScript code generation**

   Generate type-safe wrapper functions based on argument metadata:
   ```typescript
   // Generated
   export const greeting = (args: { name: string }) =>
     format(compiledGreeting, locale, args);
   ```

### Medium Priority

3. **Evaluate tag children structure**

   Could optimize JSON size by not wrapping single-child tags:
   ```typescript
   // Current: [["b", 5, ["bold"]]]
   // Optimized: [["b", 5, "bold"]]
   ```
   Would need to handle this in formatBranch logic.

4. **Add CLI for batch processing**

   A simple CLI for compiling message catalogs:
   ```bash
   icu-minify compile messages.json -o compiled.json
   ```

### Low Priority

5. **Bracket notation interpolation**

   Optional support for `"Hello [0]!"` syntax as alternative to ICU.

## Summary

Both implementations are nearly identical in their core approach and JSON format. The main differences are:

- **icu-minify** has zero runtime dependencies and cleaner TypeScript types
- **icu-to-json** has better tooling (CLI, type generation, argument extraction)

The ideal solution would combine icu-minify's zero-dependency runtime with icu-to-json's developer experience features.
