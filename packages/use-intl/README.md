# 🌐 use-intl

![Gzipped size](https://badgen.net/bundlephobia/minzip/use-intl) ![Tree shaking supported](https://badgen.net/bundlephobia/tree-shaking/use-intl) [<img src="https://img.shields.io/npm/dw/use-intl.svg" />](https://www.npmjs.com/package/use-intl)

> Internationalization for React that gets out of your way.

## Features

Internationalization is an essential part of the user experience. use-intl gives you everything you need to get language subtleties right and has always got your back whenever you need to fine-tune a translation.

- 🌟 **ICU message syntax**: Localize your messages with interpolation, cardinal & ordinal plurals, enum-based label selection and rich text.
- 📅 **Dates, times & numbers**: Apply appropriate formatting without worrying about server/client differences like time zones.
- ✅ **Type-safe**: Speed up development with autocompletion for message keys and catch typos early with compile-time checks.
- 💡 **Hooks-only API**: Learn a single API that can be used across your code base to turn translations into plain strings or rich text.
- ⚔️ **Standards-based**: Use the best parts of built-in JavaScript APIs and supplemental lower-level APIs from Format.JS.

## What does it look like?

This library is based on the premise that messages can be grouped by namespaces (typically a component name).

```jsx
// UserProfile.tsx
import {useTranslations} from 'next-intl';
 
export default function UserProfile({user}) {
  const t = useTranslations('UserProfile');
 
  return (
    <section>
      <h1>{t('title', {firstName: user.firstName})}</h1>
      <p>{t('membership', {memberSince: user.memberSince})}</p>
      <p>{t('followers', {count: user.numFollowers})}</p>
    </section>
  );
}
```

```json
// en.json
{
  "UserProfile": {
    "title": "{username}'s profile",
    "membership": "Member since {memberSince, date, short}",
    "followers": "{count, plural, ↵
                    =0 {No followers yet} ↵
                    =1 {One follower} ↵
                    other {# followers} ↵
                  }"
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
