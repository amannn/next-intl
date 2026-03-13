# `icu-minify`

ICU message format compiler with a 650 bytes runtime ✨

## Features

1. **Build-time compilation** ⚡  
   Converts ICU messages to a compact JSON intermediate representation
2. **Minimal runtime** 📦  
   650 bytes (minified + compressed) with zero runtime dependencies
3. **Full ICU support** 🌍  
   `{arguments}`, `plural`, `select`, `selectordinal`, `date`, `time`, `number` and `<tags>`

## Usage

```ts
import compile from 'icu-minify/compile';
import format from 'icu-minify/format';

// At build time
const compiled = compile('Hello {name}!');

// ["Hello ", ["name"], "!"]
console.log(compiled);

// At runtime
format(compiled, 'en', {name: 'World'});
```

## Acknowledgments

This library is heavily inspired by [`icu-to-json`](https://github.com/jantimon/icu-to-json) and [`@lingui/message-utils`](https://github.com/lingui/js-lingui/tree/main/packages/message-utils), which similarly use an array-based intermediate representation for compiled messages.

## Design

For detailed design rationale, motivation, tradeoffs, and implementation details, see [RFC: Ahead-of-time compilation of ICU messages](../../rfcs/002-icu-message-precompilation.md).
