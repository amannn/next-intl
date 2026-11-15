# @eloqnt/format-json

JSON messages support for [eloqnt/cli](https://cli.eloqnt.dev/docs) and [next-intl](https://next-intl.dev).

This package backs the built-in `format: 'json'` setting:

```ts
import {defineConfig} from '@eloqnt/cli';

export default defineConfig({
  messages: {
    path: './messages/{locale}',
    locales: 'infer',
    sourceLocale: 'en',
    format: 'json'
  }
});
```

See the [docs](https://cli.eloqnt.dev/docs/formats/json) for details.
