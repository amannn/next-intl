# icu-minify

> Minimal ICU MessageFormat compiler and runtime

## Features

- **Build-time compilation**: Converts ICU messages to compact JSON at build time
- **Minimal runtime**: ~1KB gzipped runtime formatter using native `Intl` APIs
- **Full ICU support**: Arguments, plurals, `select`, `selectordinal`, date/time/number formatting, tags
- **Zero runtime dependencies**: Uses native browser/Node.js `Intl` APIs

## Usage

```ts
import {compile} from 'icu-minify/compiler';
import {format} from 'icu-minify/format';

// At build time
const compiled = compile('Hello {name}!');

// At runtime
format(compiled, 'en', {name: 'World'});
```

## API

### `compile(message: string): CompiledMessage`

Compiles an ICU message string to a compact JSON representation.

### `format<T>(message: CompiledMessage, locale: string, values?: FormatValues<T>): string | Array<string | T>`

Formats a compiled message with the given locale and values.

- Returns a `string` when all values resolve to strings
- Returns an `Array<string | T>` when tag handlers return non-string values

## Acknowledgments

This library is heavily inspired by [`icu-to-json`](https://github.com/jantimon/icu-to-json) by Jan Nicklas. The core JSON format and approach are nearly identical. See [`DESIGN.md`](./DESIGN.md) for details.
