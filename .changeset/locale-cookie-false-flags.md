---
'next-intl': patch
---

Leave `localeCookie` flags that are set to `false` (e.g. `secure: false`, `partitioned: false`) out of the cookie that `Link` and `useRouter` write when switching the locale, instead of writing them as if they were `true`.
