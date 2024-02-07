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
3. `pnpm install` (includes an initial build of the packages)

Now, you're all set and you can work on individual packages.

### Tests

There are currently two test setups:
1. Packages use [Vitest](https://vitest.dev/)
2. Examples use [Playwright](https://playwright.dev/)

In either case, you can focus individual tests during development via `it.only`.

### Code formatting (ESLint & Prettier)

This project uses ESLint both for detecting issues in code, as well as for formatting.

Prettier is integrated via an autofixable ESLint rule, therefore it's recommended to autofix all ESLint issues on save in your editor:

```js
// settings.json (VSCode)
{
  "[typescriptreact]": {
    "editor.defaultFormatter": "dbaeumer.vscode-eslint",
    "editor.formatOnSave": true
  }
}
```

For ESLint to work correctly, you should open individual packages you work on as the workspace root (e.g. `./packages/next-intl`).

Alternatively, you can run ESLint via the command line:

```sh
pnpm eslint src --fix
```

### Pull requests

This repository uses [action-semantic-pull-request](https://github.com/amannn/action-semantic-pull-request) to ensure that pull request titles match the [Conventional Commits spec](https://www.conventionalcommits.org/en/v1.0.0/). This is due to PR titles being used as commit messages to [automate releases](#releases).

## Repository workflows

- New issues receive the `unconfirmed` label upon creation and should be regularly triaged. If the issue is actionable, the `unconfirmed` label should be removed. If this is not the case, the issue will be closed after 30 days.
- Add the `reproduction-missing` label to an issue to automatically add a comment and to mark it for being automatically closed in the future in case no reproduction gets added.
- Add the `needs-isolation` label to issues that require further isolation since they might contain extraneous code or 3rd party libraries that make it hard to understand if an issue is caused by `next-intl`.

## Releases

Releases are automated via Lerna. To determine the next version, [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) is used and will trigger a release for every commit on `main` that uses one of these prefixes:

1. `fix: `: Patch release
2. `feat: `: Minor release

Due to this, it's important to clean up commit messages of merged PRs since the commit title will appear in the changelog. Note that the PR title and description should be cleaned up by the person who initiates the merge since the PR is linked to from the changelog and should contain relevant details.

Note that the exclamation mark syntax (`!`) for indicating breaking changes is currently [not supported by Lerna](https://github.com/lerna/lerna/issues/2668#issuecomment-1467902595). Instead, a block like `BREAKING CHANGE: Dropped support for Node.js 12` should be added to the body of the commit message.

Other prefixes that are allowed and will *not* create a release are the following:

1. `docs`: Documentation-only changes
2. `test`: Missing tests were added or existing ones corrected
3. `build`: Changes that affect the build system or external dependencies
4. `ci`: Changes to CI configuration files and scripts
5. `chore`: Other changes that don't modify src or test files

