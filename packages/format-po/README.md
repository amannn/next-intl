# @eloqnt/format-po

Gettext-style PO files for [eloqnt/cli](https://cli.eloqnt.dev/docs) and [next-intl](https://next-intl.dev).

This package backs the built-in `format: 'po'` setting:

```ts
import {defineConfig} from '@eloqnt/cli';

export default defineConfig({
  messages: {
    path: './messages/{locale}',
    locales: 'infer',
    sourceLocale: 'en',
    format: 'po'
  }
});
```

See the [docs](https://cli.eloqnt.dev/docs/formats/po) for details.
