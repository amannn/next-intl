---
'@eloqnt/extractor': patch
'next-intl': patch
---

Fail `next build` and `unstable_extractMessages` with the file name when a source file can't be parsed, instead of writing messages files without that file's messages. During `next dev`, messages files stay unchanged until the file parses again.
