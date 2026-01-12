# icu-minify

> Minimal ICU MessageFormat compiler and runtime

## Features

- **Build-time compilation**: Converts ICU messages to compact JSON at build time
- **Minimal runtime**: ~1KB gzipped runtime formatter using native Intl APIs
- **Full ICU support**: Arguments, plurals, select, selectordinal, date/time/number formatting, tags
- **Zero runtime dependencies**: Uses native browser/Node.js Intl APIs

## Installation

```bash
npm install icu-minify
```

## Usage

### Compile (build-time)

```ts
import {compile} from 'icu-minify/compiler';

const compiled = compile('Hello {name}!');
// Store compiled result as JSON
```

### Format (runtime)

```ts
import {format} from 'icu-minify/format';

const result = format(compiled, 'en', {name: 'World'});
// "Hello World!"
```

### Plurals

```ts
const compiled = compile('{count, plural, one {# item} other {# items}}');
format(compiled, 'en', {count: 1}); // "1 item"
format(compiled, 'en', {count: 5}); // "5 items"
```

### Date/Time/Number formatting

```ts
const compiled = compile('Price: {price, number, currency/USD}');
format(compiled, 'en', {price: 99.99}); // "Price: $99.99"

const compiled = compile('Date: {date, date, medium}');
format(compiled, 'en', {date: new Date()}); // "Date: Jan 12, 2026"
```

### Rich text with tags

```ts
const compiled = compile('Hello <b>{name}</b>!');
format(compiled, 'en', {
  name: 'World',
  b: (chunks) => `<strong>${chunks.join('')}</strong>`
});
// "Hello <strong>World</strong>!"
```

## API

### `compile(message: string): CompiledMessage`

Compiles an ICU message string to a compact JSON representation.

### `format<T>(message: CompiledMessage, locale: string, values?: FormatValues<T>): string | Array<string | T>`

Formats a compiled message with the given locale and values.

- Returns a `string` when all values resolve to strings
- Returns an `Array<string | T>` when tag handlers return non-string values

## License

MIT
