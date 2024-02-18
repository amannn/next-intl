# example-pages-router

An example that showcases a basic installation of `next-intl` with the Pages Router.

The relevant integration code is:

1. [Set up translations in `messages/`](./messages/en.json)
2. [Set up `NextIntlClientProvider` in `src/pages/_app.tsx`](./src/pages/_app.tsx#L6)
3. [Provide messages in `src/pages/index.tsx`](./src/pages/index.tsx#L20)
4. [Use translations in `src/pages/index.tsx`](./src/pages/index.tsx#L7)

## Deploy your own

By deploying to [Vercel](https://vercel.com), you can check out the example in action. Note that you'll be prompted to create a new GitHub repository as part of this, allowing you to make subsequent changes.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/amannn/next-intl/tree/main/examples/example-pages-router)
