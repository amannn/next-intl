# icu-minify Design Document

This document describes the design decisions behind `icu-minify`, a minimal ICU MessageFormat compiler and runtime.

## Requirements

The following requirements guided the design:

1. **Minifies extremely well** - The compiled format should compress efficiently with gzip/brotli
2. **Is plain JSON** - The format must be valid JSON that can be stored in JSON files or embedded in JS/TS
3. **Can format reliably** - The runtime must correctly format all ICU MessageFormat constructs
4. **Fast runtime** - Formatting should be efficient with minimal overhead
5. **Zero runtime dependencies** - The runtime should use only native Intl APIs

### How Requirements Are Achieved

| Requirement       | Implementation                                                                                             |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| Minifies well     | Compact array format with short type constants (1-6), strings as literals, repeated patterns compress well |
| Plain JSON        | All values are strings, numbers, arrays, or objects - no functions, symbols, or special types              |
| Format reliably   | Comprehensive test suite covering all ICU constructs; uses proven @formatjs/icu-messageformat-parser       |
| Fast runtime      | No parsing at runtime, direct traversal of pre-compiled structure, native Intl formatters                  |
| Zero dependencies | Uses native Intl.PluralRules, Intl.NumberFormat, Intl.DateTimeFormat                                       |

## Compiled Format

### Type Constants

```
POUND = 0
SELECT = 1
PLURAL = 2
SELECTORDINAL = 3
NUMBER = 4
DATE = 5
TIME = 6
```

Tags have no type constant - they're detected by checking if the second element is not a number.

### Node Types

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

### Examples

| Input                                         | Compiled Output                                         |
| --------------------------------------------- | ------------------------------------------------------- |
| `"Hello world"`                               | `"Hello world"`                                         |
| `"Hello {name}"`                              | `["Hello ", ["name"]]`                                  |
| `"<b>bold</b>"`                               | `[["b", "bold"]]`                                       |
| `"<b>{name}</b>"`                             | `[["b", ["name"]]]`                                     |
| `"{n, plural, one {# item} other {# items}}"` | `[["n", 2, {one: [0, " item"], other: [0, " items"]}]]` |

## Comparison with Related Libraries

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

### Design Choices

**Distinct type constants for formats (4/5/6)**: More compact than `[name, 4, "number"]` used by icu-to-json since the subtype is encoded in the constant itself.

**No TYPE constant for tags**: Tags are detected by `typeof node[1] !== 'number'`. Saves bytes per tag.

**Numeric type constants**: More compact than Lingui's string types (`"plural"` vs `2`).

**No plural offset**: Simplifies runtime; rarely needed in practice.

**Zero runtime dependencies**: Uses native Intl APIs (PluralRules, NumberFormat, DateTimeFormat).

## Acknowledgments

Inspired by [icu-to-json](https://github.com/jantimon/icu-to-json) and [Lingui](https://github.com/lingui/js-lingui).
