# icu-minify

ICU message format compiler with a <1KB runtime bundle footprint.

## Features

- **Build-time compilation**: Converts ICU messages to compact JSON at build time.
- **Minimal runtime**: <1KB runtime formatter using native `Intl` APIs.
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

This library is heavily inspired by [`icu-to-json`](https://github.com/jantimon/icu-to-json) by Jan Nicklas and [Lingui](https://github.com/lingui/js-lingui), which similarly use an array-based intermediate representation for compiled messages.

See [`DESIGN.md`](./DESIGN.md) for details.
