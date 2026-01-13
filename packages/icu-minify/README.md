# icu-minify

ICU message format compiler with a 660 byte runtime bundle.

## Features

- **Build-time compilation**: Converts ICU messages to compact JSON at build time.
- **Minimal runtime**: 660 bytes (minified + brotli) using native `Intl` APIs.
- **Full ICU support**: Arguments, plurals, `select`, `selectordinal`, date/time/number formatting, tags.
- **Zero runtime dependencies**: Uses native browser/Node.js `Intl` APIs.

## Usage

```ts
import compile from 'icu-minify/compiler';
import format from 'icu-minify/format';

// At build time
const compiled = compile('Hello {name}!');

// At runtime
format(compiled, 'en', {name: 'World'});
```

## Acknowledgments

This library is heavily inspired by [`icu-to-json`](https://github.com/jantimon/icu-to-json) and [Lingui](https://github.com/lingui/js-lingui), which similarly use an array-based intermediate representation for compiled messages.

See [`DESIGN.md`](./DESIGN.md) for details.
