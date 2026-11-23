# Security policy

## Supported versions

Only the latest version of each package receives security fixes.

## Reporting a vulnerability

Please [report vulnerabilities privately](https://github.com/amannn/next-intl/security/advisories/new), not in public issues, discussions or pull requests, and keep them private until the advisory is published.

A report should include:

- The affected package and version
- A minimal reproduction in a real app that uses the package's public API
- What an attacker controls and what they gain

You can expect a reply within a week. If the report is confirmed, the fix is developed in the advisory's temporary private fork and released as a patch. The advisory is published with a CVE once the patch is available, usually within 90 days of the report. Reporters are credited in the advisory unless they prefer not to be.

## Scope

This policy covers all packages published from this repository. Examples, the docs site and repository tooling are out of scope.

A vulnerability lets an attacker cross one of these trust boundaries:

| Input                                                                                | Trust        |
| ------------------------------------------------------------------------------------ | ------------ |
| App code and configuration (routing, `i18n/request.ts`, plugin options)              | Trusted      |
| Source files read by the extractor                                                   | Trusted      |
| Request path, query, headers and cookies                                             | Untrusted    |
| Values passed to formatting functions (e.g. `t('greeting', {name})`)                 | Untrusted    |
| Messages and catalog files, e.g. from translators or a translation management system | Semi-trusted |

Semi-trusted means that messages must not be able to run code or pollute prototypes, but they can render any text.

The following are out of scope:

- Issues that require control over trusted input, e.g. a malicious routing config
- Spoofed `Host` or `X-Forwarded-*` headers: these need to be set by the proxy in front of the app
- Behavior that only occurs when calling internals directly and can't be reproduced in a real app (e.g. a path that Next.js normalizes before the middleware runs)
- HTML returned by `t.raw` or `t.markup` that the app renders without sanitizing, e.g. via `dangerouslySetInnerHTML`
- Vulnerabilities in dependencies without a way to exploit them through these packages
- Unverified output of scanners or AI tools

## Fixing a vulnerability

Maintainers fix confirmed vulnerabilities without a public branch or pull request:

1. Accept the report, or open a draft advisory for an issue found by a maintainer, and request a CVE on the advisory.
2. Open a pull request with the fix and a patch changeset in the advisory's temporary private fork. CI, branch protection and the PR title check don't run there, so run the tests and linting locally and use a single commit with a conventional commit message.
3. Merge the pull request on the advisory page. This lands the fix on `main`, where it's public, and stages a patch release: approve it right away to keep that gap short.
4. Once the patch is live, enter its version as the patched version and publish the advisory.
