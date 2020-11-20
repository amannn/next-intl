# next-intl

[![Stable release](https://img.shields.io/npm/v/next-intl.svg)](https://npm.im/next-intl)

Minimal, but complete solution for managing translations in Next.js apps.

## The problem

Next.js has built-in support for [internationalized routing](https://nextjs.org/docs/advanced-features/i18n-routing), but doesn't have an opinion about how you should handle your translations.

## This solution

This is my attempt at providing a minimal, but complete solution that fills in the missing pieces.

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

## Features

- Based on battle-tested building blocks from [Format.JS](https://formatjs.io/) (used by `react-intl`), this library is a thin wrapper around high-quality APIs for i18n.
- I18n is really essential for usability, therefore this library doesn't compromise on flexibility and never leaves you behind when you need to fine tune a translation. Messages use the proven [ICU syntax](https://formatjs.io/docs/core-concepts/icu-syntax).
- The bundle size comes in at [32.2kb (9.2kb gzipped)](https://bundlephobia.com/result?p=next-intl) which is the tradeoff that's necessary for the flexibility of the library.
- A hooks-only API ensures that you can use the same API for `children` as well as for attributes which expect strings.
- Integration with Next.js ensures only the least amount of configuration is necessary.

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
  // can also separate your messages further (e.g. by page) and read
  // them based on the current route.
  const messages = locale ? require(`messages/${locale}.json`) : undefined

  return {...(await NextApp.getInitialProps(context)), messages};
};
```
3. Based on the features you need, you might have to provide [polyfills](https://formatjs.io/docs/polyfills).
4. Use translations in your components!

## Usage

```js
// en.json

{
  // The recommended approach is to group messages by components.
  "Component": {
    "static": "Hello",

    // See https://formatjs.io/docs/core-concepts/icu-syntax/#simple-argument
    "interpolation": "Hello {name}",

    // See https://formatjs.io/docs/core-concepts/icu-syntax/#number-type
    "number": "{price, number, ::currency/EUR}",
    
    // See https://formatjs.io/docs/intl-messageformat#datetime-skeleton
    "date": "{now, date, medium}",
    
    // See https://formatjs.io/docs/core-concepts/icu-syntax/#plural-format
    "plural": "You have {numMessages, plural, =0 {no messages} =1 {one message} other {# messages}}.",
    
    // See https://formatjs.io/docs/core-concepts/icu-syntax/#select-format
    "select": "{gender, select, male {He} female {She} other {They}} is online.",
    
    // See https://formatjs.io/docs/core-concepts/icu-syntax/#selectordinal-format
    "selectordinal": "It's my cat's {year, selectordinal, one {#st} two {#nd} few {#rd} other {#th}} birthday!",

    // See https://formatjs.io/docs/core-concepts/icu-syntax/#rich-text-formatting
    "richText": "This is <important>important</important>",

    // Messages can be used in attributes
    "attributeUrl": "https://example.com",

    // Use nesting to provide more structure
    "nested": {
      "label": "Nested"
    }
  },

  // You don't have to group messages by components. Use whatever suits your use case.
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
    <p>{t('number', {price: 31918.231})}</p>
    <p>{t('date', {date: new Date('2020-11-20T10:36:01.516Z')})}</p>
    <p>{t('plural', {date: new Date('2020-11-20T10:36:01.516Z')})}</p>
    <p>{t('selectordinal', {year: 1})}</p>
    <p>{t('richText', important: (children: ReactNode) => <b key="important">{children}</b>)}</p>
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

## Tradeoffs

- All relevant translations for the components need to be supplied to the provider. There's no concept of lazy loading translations. However due to the page-based approach of Next.js, you can only provide the minimum of necessary messages. Ideally a build-time plugin would take care of creating message bundles based on the components used on a page (this would have to include potentially lazy loaded components as well though).
- There are smaller libraries for internationalisation, but they typically cover less features than Format.JS. However if your performance budget doesn't allow for the size of this library, you might be better off with an alternative.

## TODO

- get rid of key for rich text?
- cache format result?
- separate repo?
- Pass currency to number? (if currency is sensitive to locale, use the messages)
- Relative time
- Check other features of react-intl
