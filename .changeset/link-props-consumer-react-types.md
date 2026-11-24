---
'next-intl': patch
---

Resolve the HTML attributes of `Link` from your project's React types instead of shipping a copy from the build of `next-intl`. This removes a stray `tw` prop that leaked into the declarations of 4.16.0 and fixes type errors when your `@types/react` version differs from the one `next-intl` was built with.
