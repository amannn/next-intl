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

## Docs

- [Installation guide](./docs/installation.md)
- [Usage guide](./docs/usage.md)
- [FAQ](./docs/faq.md)
- [Changelog](./CHANGELOG.md)
