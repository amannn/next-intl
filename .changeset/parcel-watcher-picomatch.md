---
'next-intl': patch
---

Update `@parcel/watcher` to 2.6.0. This also updates its `picomatch` dependency, which resolves audit warnings for CVE-2026-33671 and CVE-2026-33672. next-intl isn't affected by these, since it only passes fixed ignore patterns to the watcher.
