# example-app-router-mdx

A small blog that uses experimental `next-intl` message extraction with MDX. One article is written once and rendered in English or German, including its page title and description.

## Run locally

This example uses the local `next-intl` workspace package. The MDX extraction feature must be available in your checkout; it is not intended to run against an older npm release.

From the repository root:

```sh
pnpm install
pnpm build-packages
pnpm --filter example-app-router-mdx dev
```

Open [localhost:3000](http://localhost:3000), then follow the article link. Use **English** and **Deutsch** in the header to switch languages. The selection is stored in a cookie, so the URL stays the same, including when switching from the article.

To check or build the example:

```sh
pnpm --filter example-app-router-mdx lint
pnpm --filter example-app-router-mdx build
pnpm --filter example-app-router-mdx start
```

## How it works

`next.config.mjs` enables extraction and adds the official MDX plugin:

```js
import createMDX from '@next/mdx';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin({
  experimental: {
    extract: {mdx: true},
    srcPath: './src',
    messages: {
      path: './messages',
      format: 'json',
      locales: ['en', 'de'],
      sourceLocale: 'en'
    }
  }
});

const withMDX = createMDX({
  options: {
    recmaPlugins: ['next-intl/extractor/mdx']
  }
});

const config = {pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx']};

export default withNextIntl(withMDX(config));
```

- `src/app/page.tsx` lists the blog's first post using `useExtracted`.
- `src/app/blog/welcome/page.mdx` contains the shared article. Messages use `{t('Message')}` without declaring a translator. The article also demonstrates lists, emphasis, ICU interpolation and an untranslated code block.
- The article's `export const metadata` uses the same `t` function. The plugin compiles it to `generateMetadata` using `getExtracted`.
- `src/mdx-components.tsx` wraps MDX pages in an article element.
- `src/i18n/request.ts` reads the locale cookie and loads the matching catalog. Missing or unsupported locales fall back to English.
- `messages/en.json` and `messages/de.json` hold the source messages and German translations.

Messages are extracted automatically during `next dev` and `next build`. To add a message, write another `t('Message')` call in the article or use `useExtracted` in a React component. The extractor generates its ID and updates both catalogs. Fill in its German translation in `messages/de.json`; extraction preserves existing translations. Extraction does not translate messages automatically, and no custom extraction script or generated JavaScript file is needed.

## MDX metadata and Webpack

The example uses Turbopack, which is the default in Next.js 16. A [Next.js Webpack regression](https://github.com/vercel/next.js/issues/91735) affects metadata exports in MDX, including untranslated metadata, on releases such as Next.js 16.4.6. Use Turbopack for this example on affected releases; no Webpack workaround is included here.
