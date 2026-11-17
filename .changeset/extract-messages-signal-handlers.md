---
'next-intl': patch
---

`unstable_extractMessages` no longer registers process signal handlers, which kept Ctrl+C from ending the calling script.
