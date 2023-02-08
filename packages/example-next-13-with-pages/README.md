# example-next-13-with-pages

An example that showcases a basic installation of `next-intl` in a Next.js app that uses both the pages and the new app folder.

Important to note:

1. Do not add the i18n config to the `next.config.js` as it will cause the `app` directory to be ignored.
2. Add `GetStaticPaths` and `GetStaticProps` or `GetServerSideProps` (if you need SSR) to the relevant `pages`.

You can run the example locally like this:

```
yarn && yarn dev
```
