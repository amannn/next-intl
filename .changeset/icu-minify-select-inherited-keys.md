---
'icu-minify': patch
---

Fall back to `other` in a `select` when the value matches an inherited object key like `constructor` or `toString`, also for precompiled messages loaded from JSON. Previously, formatting such a message threw an error.
