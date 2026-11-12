# Contributing to `next-intl`

Thank you so much for considering to contribute to `next-intl`!

This project is a team effort and we rely on individuals working together to build a sustainable and reliable project.

There are several ways you can contribute:

1. **Helping others by answering questions**: Developers often seek guidance by posting questions in [issues](https://github.com/amannn/next-intl/issues), [discussions](https://github.com/amannn/next-intl/discussions), and [on Stack Overflow](https://stackoverflow.com/search?q=%22next-intl%22). Your responses, based on your experience, are greatly appreciated and help foster a supportive community.
2. **Docs**: We focus on documentation as much as we do on the code itself. We strive to create helpful learning resources that efficiently communicate concepts and address common user issues. If you encounter areas that need clarification or have ideas to improve our documentation, we welcome and appreciate your contributions!
3. **Bug fixes**: Fixing a bug always starts with creating a regression test that reliably reproduces the broken behavior. This alone is a valuable contribution and can be submitted as a pull request. If you're up for the challenge, feel free to provide the bug fix as well!
4. **New features**: We encourage proposing feature ideas as issues prior to starting development. This practice helps to avoid duplicated efforts and allows us to align on the direction before investing significant development time. Note that features for exotic use cases that can already be achieved with the current feature set are unlikely to get merged, as the maintainence of such features over time takes significant effort.
5. **Sponsorship**: `next-intl` is provided free of charge, but the project takes significant time to maintain. Luckily, `next-intl` receives regular funding from its primary sponsor [Crowdin](https://crowdin.com). However, features still need to be prioritized and user support is limited. If you'd like to give back in a financial way, you can consider [providing sponsorship](https://github.com/sponsors/amannn) for the lead maintainer [@amannn](https://github.com/amannn).

Open source work should be fun for everyone involved. Let's make sure it stays that way! Our communication style aims to be clear and friendly. We value empathy, respect, and understanding different perspectives.

Thank you for being a part of this project! 🙌

## Documentation guidelines

The docs are consulted by developers with different levels of professional experience, different proficiencies of language & reading comprehension and at various points of their app development journey.

We aim to create resources that help developers in the following situations:

1. **Getting started**: Developers have limited time and need to get a job done quickly. We try to limit the necessary information to get started, use simple & friendly language and rely on good defaults to support developers. Snippets that can be copy-pasted are frequently used and provide the possibility to include important information as code comments which are typically copied along.
2. **Going deeper**: Developers who are already (somewhat) invested into `next-intl` will consult the docs to learn about advanced use cases. We use precise language so developers trust the library to work as expected, while optionally providing deep dives in expandable areas. We strive to provide relevant information that developers will likely need within the docs, but will use external links to trusted sources like MDN, Wikipedia and the Next.js docs to provide supplemental information for deep dives that aren't the main focus of `next-intl`.
3. **Fixing a bug**: Developers may run into difficult bugs and need all the help they can get. When there are missing pieces within the library, we don't try to hide them, but instead provide documentation for workarounds. Especially in the case of bugs, it's important to provide optional deep dives that include all relevant details. Still, developers typically consult the GitHub issues & discussions of the project, therefore we can provide certain solutions to specific problems there too. Developers will also google their errors, therefore common errors can be addressed with troubleshooting sections that are indexed.

## Development

### Setup

1. Make sure you have [pnpm](https://pnpm.io/) installed
2. Clone the repo
3. `pnpm install`
4. `pnpm build-packages`

Now, you're all set and you can work on individual packages.

### Tests

There are currently two test setups:

1. Packages use [Vitest](https://vitest.dev/)
2. Examples use [Playwright](https://playwright.dev/)

In either case, you can focus individual tests during development via `it.only`.

### Linting & formatting

This project uses ESLint for detecting issues in code, as well as Prettier for formatting.

It's recommended to use an editor integration for both, so that autofixable issues are automatically resolved. For editor plugins to work correctly, you should open individual packages you work on as the workspace root (e.g. `next-intl/packages/next-intl` instead of `next-intl`).

Alternatively, you can run ESLint and Prettier via the command line:

```sh
cd packages/next-intl
pnpm eslint src --fix
pnpm prettier src --write
```

### Pull requests

This repository uses [action-semantic-pull-request](https://github.com/amannn/action-semantic-pull-request) to ensure that pull request titles match the [Conventional Commits spec](https://www.conventionalcommits.org/en/v1.0.0/). PR titles become the commit messages on `main`, and use sentence case after the type prefix.

## Repository workflows

- New issues receive the `unconfirmed` label upon creation and should be regularly triaged. If the issue is actionable, the `unconfirmed` label should be removed. If this is not the case, the issue will be closed after 30 days.
- Add the `reproduction-missing` label to an issue to automatically add a comment and to mark it for being automatically closed in the future in case no reproduction gets added.
- Add the `needs-isolation` label to issues that require further isolation since they might contain extraneous code or 3rd party libraries that make it hard to understand if an issue is caused by `next-intl`.

## Releases

Releases are automated with [changesets](https://github.com/changesets/changesets). Each package is versioned independently.

### Stable releases

A PR that changes a published package adds a changeset with `pnpm changeset`, which asks for the packages, the bump type (patch, minor, major) and a summary for the changelog. PRs without changes to published packages (docs, CI, tests) don't need one.

When a PR with changesets is merged to `main`, CI consumes them right away: it bumps the versions, updates the changelogs, pushes a version commit and a tag per package, uploads the new versions with `pnpm stage publish` and creates a draft GitHub release per package. To batch several changes into one release, collect them on a branch and merge that.

Nothing is installable until a maintainer approves the staged versions with 2FA:

- `pnpm release:approve` (needs `npm login` and `gh auth login`) shows the staged versions in a picker, approves the ones you select with one OTP and publishes the draft releases. Select all staged versions, since packages can depend on each other's new versions.
- Alternatively, approve them on npmjs.com ("Staged Packages") and publish the draft releases on GitHub.

To abandon a release, reject the staged versions and delete the draft releases.

### Preview packages

Every push to `main` and every PR with the `preview` label publishes the packages to [pkg.pr.new](https://pkg.pr.new), so a change can be tried before it's released, e.g. `npm i https://pkg.pr.new/next-intl@<pr-number>`. The pkg.pr.new bot comments the install commands on the PR. Previews aren't published to npm and include all packages except the SWC plugin, which resolves to its version on npm.

### Major releases

A new major version is developed on the `next` branch in [prerelease mode](https://github.com/changesets/changesets/blob/main/docs/prereleases.md), with a PR from `next` to `main` for review:

1. Create `next` from `main`, run `pnpm changeset pre enter next` and push it.
2. Changesets merged to `next` are released like stable ones, but as prereleases (e.g. `5.0.0-next.0`) under the `next` dist-tag (`npm i next-intl@next`), with draft GitHub releases marked as prereleases.
3. Merge `main` into `next` regularly to pick up fixes.
4. For the stable release, run `pnpm changeset pre exit` on `next`, then merge `next` into `main`.
