---
'icu-minify': patch
'next-intl': patch
---

Fall back to `other` in a `select` of a precompiled message when the value matches an inherited object key like `constructor` or `toString`, instead of throwing an error.
