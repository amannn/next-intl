# Contributing to `next-intl`

Thank you so much for contributing to `next-intl`!

This project is a team effort and we rely on individuals working together to build a sustainable and reliable project.

There are several ways you can contribute:

1. **Helping others by answering questions**: Developers often seek guidance by posting questions in [issues](https://github.com/amannn/next-intl/issues), [discussions](https://github.com/amannn/next-intl/discussions), and [on Stack Overflow](https://stackoverflow.com/search?q=%22next-intl%22). Your responses, based on your experience, are greatly appreciated and help foster a supportive community.
2. **Docs**: We focus on documentation as much as we do on the code itself. We strive to create helpful learning resources that efficiently communicate concepts and address common user issues. If you encounter areas that need clarification or have ideas to improve our documentation, we welcome and appreciate your contributions!
3. **Bug fixes**: Fixing a bug always starts with creating a regression test that reliably reproduces the broken behavior. This alone is a valuable contribution and can be submitted as a pull request. If you're up for the challenge, feel free to provide the bug fix yourself!
4. **New features**: We encourage proposing feature ideas as issues prior to starting development. This practice helps to avoid duplicated efforts and allows us to align on the direction before investing significant development time.

Open source work should be fun for everyone involved. Let's make sure it stays that way! Our communication style aims to be clear and friendly. We value empathy, respect, and understanding different perspectives.

Thank you for being a part of this project! 🙌

## Development

### Setup

1. Make sure you have [pnpm](https://pnpm.io/) installed
2. Clone the repo
3. `pnpm install` (includes an initial build of the packages)

Now, you're all set and you can work on individual packages.

### Tests

There are currently two test setups:
1. **Packages**: These use [Jest](https://jestjs.io/) and support a watch mode via `pnpm test -- --watch`.
2. **Examples**: These use [Playwright](https://playwright.dev/) and currently don't have a watch mode.

In either case, you can focus individual tests during development via [`it.only`](https://jestjs.io/docs/api#testonlyname-fn-timeout).

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

Alternatively, you can run ESLint via the command line:

```sh
pnpm eslint src --fix
```

### Pull requests

This repository uses [action-semantic-pull-request](https://github.com/amannn/action-semantic-pull-request) to ensure that pull request titles match the [Conventional Commits spec](https://www.conventionalcommits.org/en/v1.0.0/). This is due to PR titles being used as commit messages to automate the releases.

## Repository workflows

- Add the `reproduction-missing` label to an issue to automatically add a comment and to mark it for being automatically closed in the future in case no reproduction gets added.
