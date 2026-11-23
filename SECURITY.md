# Security policy

## Supported versions

Only the latest version of each package receives security fixes (for `next-intl`, the latest 4.x release).

## Reporting a vulnerability

Please report vulnerabilities privately via [GitHub](https://github.com/amannn/next-intl/security/advisories/new), not in public issues, discussions or pull requests.

A report should include:

- The affected package and version
- A minimal reproduction in a real Next.js app, e.g. a repository or a sequence of requests against `next start`
- What an attacker controls and what they gain

You can expect a reply within a week. If the report is confirmed, the fix is developed in a private fork of the advisory and released as a patch. The advisory is published with a CVE once the patch is available, usually within 90 days of the report. Reporters are credited in the advisory unless they prefer not to be.

## Scope

This policy covers the packages published from this repository: `next-intl`, `use-intl`, `icu-minify`, `next-intl-swc-plugin-extractor` and the `@eloqnt/*` packages. Examples, the docs site and repository tooling are out of scope.

A vulnerability lets an attacker cross one of these trust boundaries:

| Input                                                                                | Trust        |
| ------------------------------------------------------------------------------------ | ------------ |
| App code and configuration (routing, `i18n/request.ts`, plugin options)              | Trusted      |
| Source files read by the extractor                                                   | Trusted      |
| Request path, query, headers and cookies                                             | Untrusted    |
| Values passed to formatting functions (e.g. `t('greeting', {name})`)                 | Untrusted    |
| Messages and catalog files, e.g. from translators or a translation management system | Semi-trusted |

Semi-trusted means that messages must not be able to run code or pollute prototypes, but they can render any text.

The following are not vulnerabilities in `next-intl`:

- Issues that require control over trusted input, e.g. a malicious routing config
- Spoofed `Host` or `X-Forwarded-*` headers: these need to be set by the proxy in front of the app
- Behavior that only occurs when calling internals directly and can't be reproduced in a Next.js app (e.g. a path that Next.js normalizes before the middleware runs)
- Vulnerabilities in dependencies without a way to exploit them through `next-intl`
- Unverified output of scanners or AI tools
