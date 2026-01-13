# icu-minify

ICU message format compiler with a 660 bytes runtime ✨

## Features

- ⚡ **Build-time compilation**: Converts ICU messages to a compact JSON intermediate representation.
- 📦 **Minimal runtime**: 660 bytes (minified + compressed) and zero runtime dependencies.
- 🌍 **Full ICU support**: `{arguments}`, `plural`, `select`, `selectordinal`, `date`, `time`, `number` and `<tags>`

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

This library is heavily inspired by [`icu-to-json`](https://github.com/jantimon/icu-to-json) and [`@lingui/message-utils`](https://github.com/lingui/js-lingui/tree/main/packages/message-utils), which similarly use an array-based intermediate representation for compiled messages.

See [`DESIGN.md`](./DESIGN.md) for details.
