# Contributing to `next-intl`

Thank you so much for contributing to `next-intl`!

## Local setup

```sh
git clone git@github.com:amannn/next-intl.git
cd next-intl
yarn install
yarn workspace use-intl run build
yarn workspace next-intl run build
```

Now, you're all set and you can work on individual packages.

## Pull requests

This repository uses [action-semantic-pull-request](https://github.com/amannn/action-semantic-pull-request) to ensure that pull request titles match the [Conventional Commits spec](https://www.conventionalcommits.org/en/v1.0.0/). This is due to PR titles being used as commit messages to automate the releases of npm packages.
