# example-app-router-without-i18n-routing

An example that showcases how an app can provide a locale in `i18n.ts` to `next-intl` in an App Router setup ([without i18n routing setup](https://next-intl-docs.vercel.app/docs/getting-started/app-router/without-i18n-routing)).

This app uses Server Actions in two places:

1. The locale is managed in a cookie that can be updated via `setUserLocale` in [`src/services/locale.ts`](./src/services/locale.ts).
2. The login is handled via an action that uses [`zod`](https://zod.dev/) to provide validation and returns localized error messages right from the server.

## Deploy your own

By deploying to [Vercel](https://vercel.com), you can check out the example in action. Note that you'll be prompted to create a new GitHub repository as part of this, allowing you to make subsequent changes.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/amannn/next-intl/tree/main/examples/example-app-router-without-i18n-routing)
