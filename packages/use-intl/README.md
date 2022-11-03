# 🌐 use-intl

![Gzipped size](https://badgen.net/bundlephobia/minzip/use-intl) ![Tree shaking supported](https://badgen.net/bundlephobia/tree-shaking/use-intl) ![Build passing](https://img.shields.io/github/workflow/status/amannn/next-intl/main)

> A minimal, but complete solution for managing translations, date, time and number formatting in React apps.

## Features

- 🌟 **Proven [ICU syntax](https://formatjs.io/docs/core-concepts/icu-syntax)**: This covers interpolation, plurals, ordinal pluralization, label selection based on enums and rich text. I18n is an essential part of the user experience, therefore this library doesn't compromise on flexibility and never leaves you behind when you need to fine tune a translation.
- 📅 **Built-in date, time and number formatting**: You can use global formats for a consistent look & feel of your app and integrate them with translations.
- 💡 **Hooks-only API**: This ensures that you can use the same API for `children` as well as for attributes which expect strings.
- ✅ **Type-safe**: If you're using TypeScript, you'll benefit from autocompletion for available message keys and compile-time errors for typos.
- ⚔️ **Battle-tested building blocks**: This library is a minimal wrapper around built-in browser APIs and supplemental lower-level APIs from [Format.JS](https://formatjs.io/) (used by `react-intl`).

## What does it look like?

This library is based on the premise that messages can be grouped by namespaces (typically a component name).

```jsx
// LatestFollower.js
import {useTranslations} from 'use-intl';

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

1. `npm install use-intl`
2. Add the provider
```jsx
import {IntlProvider} from 'use-intl';

// You can get the messages from anywhere you like. You can also
// fetch them from within a component and then render the provider 
// along with your app once you have the messages.
const messages = {
  "App": {
    "hello": 'Hello {username}!'
  }
};

function Root() {
  return (
    <IntlProvider messages={messages} locale="en">
      <App user={{name: 'Jane'}} />
    </IntlProvider>
  );
}

function App({user}) {
  const t = useTranslations('App');
  return <h1>{t('hello', {username: user.name})}</h1>;
}
```

Have a look at [the minimal setup example](https://codesandbox.io/s/use-intl-cra-example-13w917?file=/src/Root.tsx) to explore a working app.

## Usage

Please refer to the [`next-intl` usage docs](https://next-intl-docs.vercel.app/docs/usage) for more advanced usage, but note that you should import from `use-intl` instead of `next-intl`.
