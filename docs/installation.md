# Installation guide

## Typical setup

1. Install `next-intl` in your project.
2. Add the provider in `_app.js`.
```jsx
import {NextIntlProvider} from 'next-intl';

export default function App({Component, pageProps}) {
  return (
    <NextIntlProvider messages={pageProps.messages}>
      <Component {...pageProps} />
    </NextIntlProvider>
  );
}
```
3. Provide messages on a page-level.
```js
// pages/index.js
export function getStaticProps({locale}: GetStaticPropsContext) {
  return {
    props: {
      // You can get the messages from anywhere you like, but the recommended
      // pattern is to put them in JSON files separated by language and read 
      // the desired one based on the `locale` received from Next.js. 
      messages: require(`../../messages/index/${locale}.json`),
    }
  };
}
```
4. Make sure you have [internationalized routing](https://nextjs.org/docs/advanced-features/i18n-routing) set up or alternatively provide an explicit `locale` to `NextIntlProvider`.
5. Use translations in your components!

Have a look at [the example](../packages/example) to explore a working setup.

## Further setup (recommended)

While the above mentioned setup is typically sufficient to use `next-intl` in your Next.js app, there are a few additional steps that are recommended:

1. Based on the features you need and the browsers you support, you might have to provide [polyfills](https://formatjs.io/docs/polyfills).
2. If you're formatting dates and times, a [`timeZone` should be configured](./usage.md#time-zones). By default, dates are formatted according to the time zone of the environment, which can lead to markup mismatches if the server and the user are located in different time zones. By supplying the `timeZone` explicitly, you can ensure that dates and times are rendered the same way on the server as well as the client.
3. If you're formatting relative dates and times, a [global value for `now`](./usage.md#formatRelativeTime) can be useful. This ensures that the server and client will render the same markup. Especially if you use caching for the responses of the server, the likelyhood of mismatches increases.
4. To achieve consistent date, time and number formatting, it might be useful to set up [global formats](./usage.md#global-formats) which ensure consistent formatting across the app.
