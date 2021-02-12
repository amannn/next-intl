# next-intl 🌐

![Gzipped size](https://badgen.net/bundlephobia/minzip/next-intl) ![Tree shaking supported](https://badgen.net/bundlephobia/tree-shaking/next-intl) ![Build passing](https://img.shields.io/github/workflow/status/amannn/next-intl/main)

> A minimal, but complete solution for managing translations, date, time and number formatting in Next.js apps.

This library complements the [internationalized routing](https://nextjs.org/docs/advanced-features/i18n-routing) capabilities of Next.js by managing translations and providing them to components.

## Features

- 🌟 I18n is an essential part of the user experience, therefore this library doesn't compromise on flexibility and never leaves you behind when you need to fine tune a translation. Messages use the **proven [ICU syntax](https://formatjs.io/docs/core-concepts/icu-syntax)** which covers interpolation, plurals, ordinal pluralization, label selection based on enums and rich text.
- 📅 Built-in **date, time and number formatting** provides all the necessary parts you need for localisation. You can use global formats for a consistent look & feel of your app and integrate them with translations.
- 💡 A **hooks-only API** ensures that you can use the same API for `children` as well as for attributes which expect strings.
- ⚔️ Based on **battle-tested** building blocks from [Format.JS](https://formatjs.io/) (used by `react-intl`) and modern browser APIs, this library is a thin wrapper around high-quality, lower-level APIs for i18n.
- 🚀 By integrating with both **static as well as server side rendering** you always get the best possible performance from your app.

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

## Docs

- [Installation guide](./docs/installation.md)
- [Usage guide](./docs/usage.md)
- [FAQ](./docs/faq.md)
- [Changelog](./CHANGELOG.md)
