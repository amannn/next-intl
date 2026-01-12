# icu-minify Design Document

This document describes the design decisions behind `icu-minify`, a minimal ICU MessageFormat compiler and runtime.

## Acknowledgments

This implementation is heavily inspired by [jantimon/icu-to-json](https://github.com/jantimon/icu-to-json). The core JSON format is nearly identical, and many of the design patterns were derived from studying that project. Key differences are documented in the comparison section below.

## Requirements

The following requirements guided the design:

1. **Minifies extremely well** - The compiled format should compress efficiently with gzip/brotli
2. **Is plain JSON** - The format must be valid JSON that can be stored in JSON files or embedded in JS/TS
3. **Can format reliably** - The runtime must correctly format all ICU MessageFormat constructs
4. **Fast runtime** - Formatting should be efficient with minimal overhead
5. **Zero runtime dependencies** - The runtime should use only native Intl APIs

### How Requirements Are Achieved

| Requirement | Implementation |
|------------|----------------|
| Minifies well | Compact array format with short type constants (1-4), strings as literals, repeated patterns compress well |
| Plain JSON | All values are strings, numbers, arrays, or objects - no functions, symbols, or special types |
| Format reliably | Comprehensive test suite covering all ICU constructs; uses proven @formatjs/icu-messageformat-parser |
| Fast runtime | No parsing at runtime, direct traversal of pre-compiled structure, native Intl formatters |
| Zero dependencies | Uses native Intl.PluralRules, Intl.NumberFormat, Intl.DateTimeFormat |

## Compiled Format

### Type Constants

```
SELECT = 1
PLURAL = 2
SELECTORDINAL = 3
FORMAT = 4
```

Tags have no type constant - they're detected by checking if the second element is not a number.

### Node Types

| Node | Format | Example |
|------|--------|---------|
| String | `"text"` | `"Hello"` |
| Pound sign | `0` | `0` (represents `#` in plural) |
| Simple arg | `["name"]` | `["name"]` |
| Tag | `["tagName", ...children]` | `["b", "bold"]` |
| Select | `["name", 1, {options}]` | `["gender", 1, {male: "He", other: "They"}]` |
| Plural | `["name", 2, {options}]` | `["n", 2, {one: "item", other: "items"}]` |
| Plural w/offset | `["name", 2, [{options}, offset]]` | `["n", 2, [{...}, 1]]` |
| Ordinal | `["name", 3, {options}]` | `["n", 3, {one: [0, "st"], other: [0, "th"]}]` |
| Number format | `["name", 4, "number", style?]` | `["val", 4, "number", "percent"]` |
| Date format | `["name", 4, "date", style?]` | `["d", 4, "date", "short"]` |
| Time format | `["name", 4, "time", style?]` | `["t", 4, "time", "medium"]` |

### Examples

| Input | Compiled Output |
|-------|----------------|
| `"Hello world"` | `"Hello world"` |
| `"Hello {name}"` | `["Hello ", ["name"]]` |
| `"<b>bold</b>"` | `[["b", "bold"]]` |
| `"<b>{name}</b>"` | `[["b", ["name"]]]` |
| `"{n, plural, one {# item} other {# items}}"` | `[["n", 2, {one: [0, " item"], other: [0, " items"]}]]` |

## Comparison with icu-to-json

### Similarities

Both libraries share the same core goal and approach:
- Parse ICU messages at build time using `@formatjs/icu-messageformat-parser`
- Compile to compact JSON
- Format at runtime with a minimal formatter

The JSON formats are nearly identical:
- Same type constants (SELECT=1, PLURAL=2, SELECTORDINAL=3, FORMAT=4)
- Same structure for arguments, select, plural, and format nodes
- Same pound sign representation (`0`)

### Differences

| Aspect | icu-minify | icu-to-json |
|--------|-----------|-------------|
| Tag format | `["tagName", child1, ...]` (no type) | `["tagName", 5, child1, ...]` (TYPE=5) |
| Runtime deps | Zero (native Intl) | @messageformat/runtime |
| Type generation | No | Yes (CLI can generate TS types) |
| Argument metadata | No | Yes (returns argument info) |
| CLI | No | Yes |
| String interpolation | ICU only | Also supports bracket notation |

### Why We Differ

**No TYPE constant for tags**: Saves 3 bytes per tag in the output. Tags are detected at runtime by checking `typeof node[1] !== 'number'`.

**No type generation**: In next-intl, type generation is handled at a higher level. The compiler focuses solely on producing minimal output.

**No CLI**: Intended for programmatic use within build pipelines, not standalone CLI usage.

**Zero runtime dependencies**: Uses native Intl APIs for all formatting (PluralRules, NumberFormat, DateTimeFormat).

## Alternative Formats Considered

### 1. Object-based format

```json
{"type": "plural", "name": "n", "options": {...}}
```

**Rejected**: Verbose, doesn't compress well, slower to parse at runtime.

### 2. String concatenation format

```
"Hello " + values.name
```

**Rejected**: Not valid JSON, requires eval or Function constructor.

### 3. Template literal format

```
`Hello ${name}`
```

**Rejected**: Not valid JSON, requires eval or Function constructor.

### 4. Custom binary format

Encode types and lengths as binary data.

**Rejected**: Not plain JSON, requires custom encoder/decoder, harder to debug.

### 5. Verbose type names

```
["name", "select", {...}]
```

**Rejected**: Strings don't compress as well as numbers, larger output.

## Bundle Size

| Component | Size (brotli) |
|-----------|---------------|
| Runtime (`format.js`) | ~1KB |
| Compiler (`compiler.js`) | ~2KB |

The runtime is intentionally kept minimal for production use. The compiler is only needed at build time.
