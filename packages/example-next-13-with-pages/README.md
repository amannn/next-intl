# example-next-13-with-pages

An example that showcases a basic installation of `use-intl` in a Next.js app that uses both the pages and the new app folder.

Important to note:

1. Set up your project according to the official [docs for Next.js 13](https://next-intl-docs.vercel.app/docs/next-13)
2. Do not add the i18n config to the `next.config.js` as it does not work with the new `app` folder and the `pages` folder.
3. Add a new `locale` folder in the root of your pages and add all of your pages to the `locale` folder.
4. Add `GetStaticPaths` and `GetStaticProps` or `GetServerSideProps` (if you need SSR) to the relevant `pages`.

You can run the example locally like this:

```
yarn && yarn dev
```

An example that showcases usage of `next-intl` in the `app` folder and the `pages` folder of Next.js 13.

[Demo](https://csb-k2ien9-7ytkomg4x-amann.vercel.app/en)
