# Installation guide

1. Install `next-intl` in your project
2. Add the provider in `_app.js`
```jsx
import {NextIntlProvider} from 'next-intl';
import NextApp from 'next/app';

export default function App({Component, pageProps}) {
  return (
    <NextIntlProvider messages={pageProps.messages}>
      <Component {...pageProps} />
    </NextIntlProvider>
  );
}
```
3. Provide messages on a page-level
```js
// pages/index.js
export function getStaticProps({locale}: GetStaticPropsContext) {
  return {
    props: {
      messages: {
        // You can get the messages from anywhere you like, but the recommended
        // pattern is to put them in JSON files separated by language and read 
        // the desired one based on the `locale` received from Next.js. 
        ...require(`../../messages/index/${locale}.json`),

        // If you have shared messages that should be available for all pages,
        // you can put them in a common file as shown here. Alternatively you
        // can provide them via `App.getInitialProps` in `_app` and merge them
        // with the messages from individual pages.
        ...require(`../../messages/shared/${locale}.json`)
      }
    }
  };
}
```
4. Based on the features you need and the browsers you support, you might have to provide [polyfills](https://formatjs.io/docs/polyfills).
5. Make sure you have [internationalized routing](https://nextjs.org/docs/advanced-features/i18n-routing) set up or alternatively provide an explicit `locale` to `NextIntlProvider`.
6. Use translations in your components!

Have a look at [the example](./packages/example) to explore a working setup.
