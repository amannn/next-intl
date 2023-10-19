<h1 align="center">
	<br>
	<br>
    <a href="https://next-intl-docs.vercel.app/">
      <img width="400" src="media/logo.svg" alt="next-intl">
    </a>
	<br>
	<br>
	<br>
</h1>

> Internationalization (i18n) for Next.js that gets out of your way.

![Gzipped size](https://badgen.net/bundlephobia/minzip/next-intl) ![Tree shaking supported](https://badgen.net/bundlephobia/tree-shaking/next-intl) [<img src="https://img.shields.io/npm/dw/next-intl.svg" />](https://www.npmjs.com/package/next-intl)

<hr />

📣 [Support for Next.js 13 and the App Router has arrived →](https://next-intl-docs.vercel.app/docs/next-13)

<hr />

## Features

Internationalization is an essential part of the user experience. next-intl gives you everything you need to get language subtleties right and has always got your back whenever you need to fine-tune a translation.

- 🌟 **ICU message syntax**: Localize your messages with interpolation, cardinal & ordinal plurals, enum-based label selection and rich text.
- 📅 **Dates, times & numbers**: Apply appropriate formatting without worrying about server/client differences like time zones.
- ✅ **Type-safe**: Speed up development with autocompletion for message keys and catch typos early with compile-time checks.
- 💡 **Hooks-only API**: Learn a single API that can be used across your code base to turn translations into plain strings or rich text.
- 🚀 **Next.js-native and performance-obsessed**: App Router, Server Components, static rendering—pick the right tool for the right job, next-intl works everywhere.
- ⚔️ **Internationalized routing**: Provide unique pathnames per language and optionally localize pathnames for search engine optimization.

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

### [→ Read the docs](https://next-intl-docs.vercel.app/)

<div align="center">
  <a href="https://next-intl-docs.vercel.app/redirect?href=https://crowdin.com" target="_blank">
    <img width="350" src="media/partner.svg" alt="Crowdin logo">
  </a>
  <br>
  <p>Hosted on <a href="https://vercel.com?utm_source=next-intl&utm_campaign=oss">Vercel</a></p>
</div>
