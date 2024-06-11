# 🌐 use-intl

> Internationalization (i18n) for React

## Features

Internationalization (i18n) is an essential part of the user experience, therefore `use-intl` gives you all the parts you need to get language nuances right.

- 🌟 **ICU message syntax**: Localize your messages with interpolation, cardinal & ordinal plurals, enum-based label selection and rich text.
- 📅 **Dates, times & numbers**: Apply appropriate formatting without worrying about server/client differences like time zones.
- ✅ **Type-safe**: Speed up development with autocompletion for message keys and catch typos early with compile-time checks.
- 💡 **Hooks-based API**: Learn a single API that can be used across your code base to turn translations into plain strings or rich text.
- ⚔️ **Standards-based**: Use the best parts of built-in JavaScript APIs and supplemental lower-level APIs from Format.JS.

## What does it look like?

```jsx
// UserProfile.tsx
import {useTranslations} from 'use-intl';
 
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

```js
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
3. Use internationalization in components

```jsx
import {IntlProvider, useTranslations} from 'use-intl';

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

Have a look at [the minimal setup example](https://github.com/amannn/next-intl/tree/main/examples/example-use-intl) to explore a working app.

### [→ Read the docs](https://next-intl-docs.vercel.app/docs/environments/core-library)
