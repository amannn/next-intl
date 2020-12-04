# next-intl 🌐

![Gzipped size](https://badgen.net/bundlephobia/minzip/next-intl) ![Tree shaking supported](https://badgen.net/bundlephobia/tree-shaking/next-intl) ![Build passing](https://img.shields.io/github/workflow/status/amannn/next-intl/main)

Minimal, but complete solution for managing internationalization in Next.js apps.

This library complements the [internationalized routing](https://nextjs.org/docs/advanced-features/i18n-routing) capabilities of Next.js by managing translations and providing them to components.

## Features

- 🌟 I18n is an essential part of the user experience, therefore this library doesn't compromise on flexibility and never leaves you behind when you need to fine tune a translation. Messages use the proven [ICU syntax](https://formatjs.io/docs/core-concepts/icu-syntax) which covers interpolation, numbers, dates, times, plurals, ordinal pluralization, label selection based on enums and rich text.
- ⚔️ Based on battle-tested building blocks from [Format.JS](https://formatjs.io/) (used by `react-intl`), this library is a thin wrapper around high-quality, lower-level APIs for i18n.
- 💡 A hooks-only API ensures that you can use the same API for `children` as well as for attributes which expect strings.
- 🚀 Integrates with both static as well as server side rendering.

## What does it look like?

This library is based on the premise that messages can be grouped by namespaces (typically a component name).

```jsx
function LatestFollower({user}) {
  const t = useTranslations('LatestFollower');

  return (
    <>
      <Text>{t('latestFollower', {username: user.name})}</Text>
      <IconButton aria-label={t('followBack')} icon={<FollowIcon />} />
    </>
  );
}
```

```js
// en.json
{
  "LatestFollower": {
    "latestFollower": "{username} started following you",
    "followBack": "Follow back"
  }
}
```

## Installation

1. Install `next-intl` in your project
2. Add the provider in `_app.js`
```jsx
import {NextIntlProvider} from 'next-intl';
import NextApp from 'next/app';

export default function App({Component, messages, pageProps}) {
  return (
    <NextIntlProvider messages={messages}>
      <Component {...pageProps} />
    </NextIntlProvider>
  );
}

App.getInitialProps = async function getInitialProps(context) {
  const {locale} = context.router;

  // You can get the messages from anywhere you like, but the recommended
  // pattern is to put them in JSON files separated by language and read 
  // the desired one based on the `locale` received from Next.js. You
  // can also separate your messages by page and fetch them in `getStaticProps`
  // in your page which will make them available on `pageProps` in the `App`.
  const messages = locale ? require(`messages/${locale}.json`) : undefined

  return {...(await NextApp.getInitialProps(context)), messages};
};
```
3. Based on the features you need and the browsers you support, you might have to provide [polyfills](https://formatjs.io/docs/polyfills).
4. Make sure you have [internationalized routing](https://nextjs.org/docs/advanced-features/i18n-routing) set up or alternatively provide an explicit `locale` to `NextIntlProvider`.
5. Use translations in your components!

Have a look at [the example](./packages/example) to explore a working setup.

## Usage

```js
// en.json

{
  // The recommended approach is to group messages by components and
  // embrace them as the primary unit of code organization in your app.
  "Component": {
    "static": "Hello",

    // See https://formatjs.io/docs/core-concepts/icu-syntax/#simple-argument
    "interpolation": "Hello {name}",

    // Static number formats
    // See also https://formatjs.io/docs/core-concepts/icu-syntax/#number-type
    "percent": "Percent: {value, number, percent}",

    // When formatting numbers, you can pass a custom formatter name which can
    // be provided and configured by the call site within the component.
    // See also https://formatjs.io/docs/core-concepts/icu-syntax/#number-type
    "price": "Price: {price, number, currency}",
    
    // See https://formatjs.io/docs/intl-messageformat#datetime-skeleton
    // Similar to number formatting, you can provide a custom formatter
    // from the call site within the component.
    "date": "Date: {now, date, medium}",

    // See https://formatjs.io/docs/intl-messageformat#datetime-skeleton
    // Same mechanism as date formatting.
    "time": "Time: {now, time, short}",
    
    // See https://formatjs.io/docs/core-concepts/icu-syntax/#plural-format
    "plural": "You have {numMessages, plural, =0 {no messages} =1 {one message} other {# messages}}.",
    
    // See https://formatjs.io/docs/core-concepts/icu-syntax/#select-format
    "select": "{gender, select, male {He} female {She} other {They}} is online.",
    
    // See https://formatjs.io/docs/core-concepts/icu-syntax/#selectordinal-format
    "selectordinal": "It's my cat's {year, selectordinal, one {#st} two {#nd} few {#rd} other {#th}} birthday!",

    // See https://formatjs.io/docs/core-concepts/icu-syntax/#rich-text-formatting
    // and https://formatjs.io/docs/intl-messageformat/#rich-text-support
    "richText": "This is <important><very>very</very> important</important>",

    // Messages can be used in attributes
    "attributeUrl": "https://example.com",

    // Use nesting to provide more structure
    "nested": {
      "label": "Nested"
    }
  },

  // You don't have to group messages by components. Use whatever suits your use case.
  // For example for shared labels you can use a common key. However, from my experience
  // I think it's often beneficial to duplicate labels across components, even if they are
  // the same in one language. Depending on the context, a different label can be more appropriate
  // (e.g. "not now" instead of "cancel"). Duplicating the labels allows to easily change them
  // later on in case you want something more specific. Duplication on the network level is
  // typically solved by gzip. In addition to this, you can achieve reuse by using shared components.
  "generic": {
    "cancel": "Cancel"
  },

  // You can also put your components behind namespaces.
  "fancyComponents": {
    "FancyComponent": {
      "hello": "Hello"
    }
  }
}
```

```js
function Component() {
  const t = useTranslations('Component');

  return (
    <p>{t('static')}</p>
    <p>{t('interpolation', {name: 'Jane'})}</p>
    <p>{t('percent', {percent: 0.2})}</p>
    <p>
      {t(
        'price',
        {price: 31918.231},
        // When custom formats are used, you can supply them via the third parameter
        {
          number: {
            currency: {
              style: 'currency',
              currency: 'EUR'
            }
          }
        )}
    </p>
    <p>{t('date', {date: new Date('2020-11-20T10:36:01.516Z')})}</p>
    <p>{t('time', {time: new Date('2020-11-20T10:36:01.516Z')})}</p>
    <p>{t('plural', {numMessages: 3})}</p>
    <p>{t('selectordinal', {year: 11})}</p>
    <p>
      {t('richText', {
        important: (children) => <b>{children}</b>,
        very: (children) => <i>{children}</i>
      })}
    </p>
    // TypeScript note: You have to cast the attribute to a string, since it 
    // can potentially return a `ReactNode`: `String(t('attributeUrl'))`
    <a href={t('attributeUrl')}>Link</a>
    <p>{t('nested.label')}</p>
  );
}

function AllTranslations() {
  // You can get all translations if you omit the namespace path.
  const t = useTranslations();
}

function FancyComponent() {
  // Or you can get messages from a nested namespace. The way the library works
  // is that there's a static path of the messages that is resolved in the hook
  // and should supply all necessary translations for the component. The remaining
  // hierarchy can be resolved by passing the respective path to the `t` function.
  const t = useTranslations('fancyComponents.FancyComponent');
}
```

If you're formatting dates, times, and numbers that are not embedded within a message, you can use a separate hook:

```js
import {useIntl} from 'next-intl';

function Component() {
  const intl = useIntl();
  const dateTime = new Date('2020-11-20T10:36:01.516Z')

  // See MDN docs for options:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat#Using_options
  intl.formatDateTime(dateTime, {year: 'numeric', month: 'numeric', day: 'numeric'});
  intl.formatDateTime(dateTime, {hour: 'numeric', minute: 'numeric'});

  // See MDN docs for options:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat#Using_options
  intl.formatNumber(499.90, {style: 'currency', currency: 'USD'});

  // When formatting relative dates, you have to supply the current time as `now`. This is necessary
  // for the function to return consistent results and to be pure. You can decide yourself how often
  // you want to update the current value. If you need exceptions like '23 seconds ago' should be
  // formatted as 'less than one minute ago' you can wrap the function and use a custom label. Note
  // that values are rounded, so e.g. if 100 seconds have passed, "2 minutes ago" will be returned.
  const now = new Date('2020-11-25T10:36:01.516Z')
  intl.formatRelativeTime(dateTime, now);
}
```

## Known tradeoffs

- The bundle size comes in at [36.1kb (10.5kb gzipped)](https://bundlephobia.com/result?p=next-intl) which is the tradeoff that's necessary for supporting all the mentioned internationalisation features. There are smaller libraries for internationalisation, but they typically cover less features than Format.JS. However if your performance budget doesn't allow for the size of this library, you might be better off with an alternative.
- All relevant translations for the components need to be supplied to the provider – there's no concept of lazy loading translations. If your app has a significant number of messages, the page-based approach of Next.js allows you to only provide the minimum of necessary messages based on the route. If you split your components by features, it might make sense to split your translation files the same way. It might be possible for this library to support automatic tree-shaking of messages in the future (see [#1](https://github.com/amannn/next-intl/issues/1)).
- If you're using `getInitialProps` in a custom `App` component you [opt-out of automatic static optimization](https://github.com/vercel/next.js/blob/master/errors/opt-out-auto-static-optimization.md#opt-out-of-automatic-static-optimization). However, pages that use `getStaticProps` are still statically optimized (even if `getStaticProps` is essentially a no-op – only the presence matters). Alternatively you can return the messages in `getStaticProps` of a page component and use the `pageProps` in `App` to configure the provider.

## Error handling

By default, when a message failed to resolve or when the formatting failed, an error will be printed on the console. In this case `${namespace}.${key}` will be rendered instead to keep your app running.

You can customize this behaviour with the `onError` and `getMessageFallback` props of `NextIntlProvider`.

```jsx
import {NextIntlProvider, IntlErrorCode} from 'next-intl';

function onError(error) {
  if (error.code === IntlErrorCode.MISSING_MESSAGE) {
    // Missing translations are expected and ok
    console.error(error);
  } else {
    // Other errors indicate a bug in the app and should be reported
    reportToErrorTracking(error);
  }
}

function getMessageFallback({namespace, key, error}) {
  const path = [namespace, key].filter((part) => part != null).join('.');

  if (error.code === IntlErrorCode.MISSING_MESSAGE) {
    return `${path} is not yet translated`;
  } else {
    return `Dear developer, please fix this: ${path}`;
  }
}

<NextIntlProvider ... onError={onError} getMessageFallback={getMessageFallback}>
  <App />
</NextIntlProvider>
```

## FAQ

### How is this different from using `react-intl` directly?

- This library is built around the concept of namespaces and that components consume a single namespace.
- This library offers only a hooks-based API for message consumption. The reason for this is that the same API can be used for attributes as well as `children`.
- This library doesn't use message descriptions, which could make it harder for translaters to localize messages. Related to this, AST-based extraction from `react-intl` is not possible. This library might be more reasonable for apps where the developer sets up translations based on a design for example whereas `react-intl` is targeted at really large projects with a multitude of languages.
- This library is a bit smaller in size ([next-intl](https://bundlephobia.com/result?p=next-intl) vs [react-intl](https://bundlephobia.com/result?p=react-intl) on BundlePhobia).

### Can this be used without Next.js?

Yes, see [`use-intl`](https://github.com/amannn/next-intl/tree/main/packages/use-intl).
