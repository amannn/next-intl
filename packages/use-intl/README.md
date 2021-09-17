# use-intl 🌐

![Gzipped size](https://badgen.net/bundlephobia/minzip/use-intl) ![Tree shaking supported](https://badgen.net/bundlephobia/tree-shaking/use-intl) ![Build passing](https://img.shields.io/github/workflow/status/amannn/next-intl/main)

> A minimal, but complete solution for managing translations, date, time and number formatting in React apps.

## Features

- 🌟 Messages use the **proven [ICU syntax](https://formatjs.io/docs/core-concepts/icu-syntax)** which covers interpolation, plurals, ordinal pluralization, label selection based on enums and rich text. I18n is an essential part of the user experience, therefore this library doesn't compromise on flexibility and never leaves you behind when you need to fine tune a translation.
- 📅 Built-in **date, time and number formatting** provides all the necessary parts you need for localisation. You can use global formats for a consistent look & feel of your app and integrate them with translations.
- 💡 A **hooks-only API** ensures that you can use the same API for `children` as well as for attributes which expect strings.
- ⚔️ Based on **battle-tested** building blocks from [Format.JS](https://formatjs.io/) (used by `react-intl`), this library is a thin wrapper around high-quality, lower-level APIs for i18n.

## What does it look like?

This library is based on the premise that messages can be grouped by namespaces (typically a component name).

```js
// en.json
{
  "LatestFollower": {
    "latestFollower": "{username} started following you",
    "followBack": "Follow back"
  }
}
```

```jsx
// LatestFollower.js
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

## Installation

1. Install `use-intl` in your project
2. Add the provider
```jsx
import {IntlProvider} from 'use-intl';

// You can get the messages from anywhere you like. You can also fetch
// them from within a component and then render the provider along with
// your app once you have the messages.
const messages = {
  App: {
    hello: 'Hello'
  }
};

ReactDOM.render(
  <IntlProvider messages={messages} locale="en">
    <App />
  </IntlProvider>
)
```
3. Based on the features you need and the browsers you support, you might have to provide [polyfills](https://formatjs.io/docs/polyfills).
4. Use translations in your components!

## Usage

Please refer to the docs of [`next-intl`](https://github.com/amannn/next-intl#docs).
