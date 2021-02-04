# next-intl 🌐

![Gzipped size](https://badgen.net/bundlephobia/minzip/next-intl) ![Tree shaking supported](https://badgen.net/bundlephobia/tree-shaking/next-intl) ![Build passing](https://img.shields.io/github/workflow/status/amannn/next-intl/main)

A minimal, but complete solution for managing translations, date and number formatting in Next.js apps.

This library complements the [internationalized routing](https://nextjs.org/docs/advanced-features/i18n-routing) capabilities of Next.js by managing translations and providing them to components.

## Features

- 🌟 I18n is an essential part of the user experience, therefore this library doesn't compromise on flexibility and never leaves you behind when you need to fine tune a translation. Messages use the proven [ICU syntax](https://formatjs.io/docs/core-concepts/icu-syntax) which covers interpolation, numbers, dates, times, plurals, ordinal pluralization, label selection based on enums and rich text.
- ⚔️ Based on battle-tested building blocks from [Format.JS](https://formatjs.io/) (used by `react-intl`), this library is a thin wrapper around high-quality, lower-level APIs for i18n.
- 💯 Built-in number and date formatting that is integrated with translations, e.g. allowing for the usage of global formats for a consistent look & feel of your app.
- 💡 A hooks-only API ensures that you can use the same API for `children` as well as for attributes which expect strings.
- 🚀 Integrates with both static as well as server side rendering.

## What does it look like?

This library is based on the premise that messages can be grouped by namespaces (typically a component name).

```js
// en.json
{
  "LatestFollower": {
    "latestFollower": "<user>{username}</user> started following you {followDateRelative} ({followDate, date, short})",
    "followBack": "Follow back"
  }
}
```

```jsx
// LatestFollower.js
function LatestFollower({event}) {
  const t = useTranslations('LatestFollower');
  const intl = useIntl();

  return (
    <>
      <Text>
        {t('latestFollower', {
          user: children => <b>{children}</b>,
          username: event.user.name,
          followDateRelative: intl.formatRelativeTime(event.followDate),
          followDate: event.followDate
        })}
      </Text>
      <IconButton aria-label={t('followBack')} icon={<FollowIcon />} />
    </>
  );
}
```

```jsx
// Output
<p><b>Jane</b> started following you two weeks ago (Feb 4, 2021)</p>
<button aria-label="Follow back"><svg ... /></button>
```

## Docs

- [Installation guide](./docs/installation.md)
- [Usage guide](./docs/usage.md)
- [FAQ](./docs/faq.md)
- [Changelog](./CHANGELOG.md)
