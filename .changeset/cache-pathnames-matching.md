---
'next-intl': patch
---

Speed up matching requests against `pathnames` in the middleware and in `usePathname` by sorting the templates and compiling their regexes only once, instead of on every call.
