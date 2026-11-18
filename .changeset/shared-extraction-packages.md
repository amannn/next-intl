---
'@eloqnt/messages': minor
'@eloqnt/extractor': minor
'next-intl': patch
---

Move the message extraction internals into the new `@eloqnt/messages` and `@eloqnt/extractor` packages, so next-intl and the eloqnt CLI share one implementation. No change in behavior.
