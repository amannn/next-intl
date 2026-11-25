# Security policy

## Supported versions

Only the latest version of each package receives security fixes.

## Reporting a vulnerability

Please [report vulnerabilities privately](https://github.com/amannn/next-intl/security/advisories/new), not in public issues, discussions or pull requests, and keep them private until the advisory is published.

A report should include:

- The affected package and version
- A minimal reproduction in a real app that uses the package's public API
- What an attacker controls and what they gain

You can expect a reply within a week. If the report is confirmed, the fix is developed in the advisory's temporary private fork and released as a patch. The advisory is published with a CVE once the patch is available. Reporters are credited in the advisory unless they prefer not to be.

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

## Audits

Changes are reviewed as pull requests come in. Maintainers also re-review the codebase from time to time, e.g. with fuzzing and AI agents as models improve. Findings are checked against the scope and trust boundaries above and against previous advisories, and only count as vulnerabilities once confirmed against the current release in a real app.

## Fixing a vulnerability

Maintainers fix confirmed vulnerabilities without a public branch or pull request:

1. Accept the report, or open a draft advisory for an issue found by a maintainer. Once the issue is confirmed, request a CVE on the advisory.
2. Develop the fix with a patch changeset in the advisory's temporary private fork. Several vulnerabilities can share one fork and release, with one advisory each. CI doesn't run in the fork, so run the checks locally. Keep commit messages factual, since they're public before the advisory. The advisory page merges only one pull request into `main`, so fixes reviewed separately are combined into one pull request and the others are closed.
3. Merge that pull request on the advisory page. This lands the fix on `main`, where it's public, and stages a patch release. Approve it as soon as CI on `main` passes, to keep that gap short.
4. Once the patch is live, enter its version as the patched version and publish the advisories the same day.

Issues that can't be exploited in practice are fixed as hardening, without an advisory.
