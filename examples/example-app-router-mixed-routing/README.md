# example-app-router-mixed-routing

An example for how to achieve locale prefixes on public routes while reading the locale from user settings on pages for logged in users.

Note that the locale from the public pages is currently not synced to the language preference of the user. This could of course be added if desired.

Relevant docs:
 - [Setting up `next-intl` with i18n routing](https://next-intl-docs.vercel.app/docs/getting-started/app-router/with-i18n-routing)
 - [Setting up `next-intl` without i18n routing](https://next-intl-docs.vercel.app/docs/getting-started/app-router/without-i18n-routing)

Relevant parts in app code:
 - `src/middleware.ts`: Add a hint if it's a public route or not that we can read in `i18n.ts`
 - `src/i18n.ts`: Uses the locale from the pathname segment for public routes or returns a locale from the user profile for internal app routes.
 - `src/navigation.public.ts`: Navigation APIs that automatically consider the `[locale]` segment for public routes. For internal app routes, the navigation APIs from Next.js should be used directly (see `PublicNavigation.tsx` vs `AppNavigation.tsx`).

Note that static rendering is currently not supported on public routes since we need to read a header. If this is a requirement, you could alternatively consider a monorepo setup and build the public and internal app separately. This could be a good alternative anyway.

## Deploy your own

By deploying to [Vercel](https://vercel.com), you can check out the example in action. Note that you'll be prompted to create a new GitHub repository as part of this, allowing you to make subsequent changes.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/amannn/next-intl/tree/main/examples/example-app-router-mixed-routing)
