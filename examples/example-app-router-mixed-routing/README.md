# example-app-router-mixed-routing

An example of how to achieve locale prefixes on public routes while reading the locale from user settings on pages for logged-in users.

**Relevant docs:**

1. [Setting up `next-intl` with i18n routing](https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing)
2. [Setting up `next-intl` without i18n routing](https://next-intl.dev/docs/getting-started/app-router/without-i18n-routing)

**Relevant parts in app code:**

1. [`src/middleware.ts`](./src/middleware.ts): Only run middleware on public pages that need to be localized.
2. [`src/i18n/request.ts`](./src/i18n/request.ts): Use the locale from the pathname segment for public routes or return a locale from the user profile for internal app routes.
3. [`src/i18n/navigation.public.ts`](./src/i18n/navigation.public.ts): These are the navigation APIs that automatically consider the `[locale]` segment for public routes. For internal app routes, the navigation APIs from Next.js should be used directly (see `PublicNavigation.tsx` vs `AppNavigation.tsx`).

Note that while this approach works fine, you can alternatively also consider a monorepo setup and build the public and internal app separately if you'd like to separate the code for the two apps.

## Deploy your own

By deploying to [Vercel](https://vercel.com), you can check out the example in action. Note that you'll be prompted to create a new GitHub repository as part of this, allowing you to make subsequent changes.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/amannn/next-intl/tree/main/examples/example-app-router-mixed-routing)
