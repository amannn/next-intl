# example

An example that showcases a basic installation of `next-intl`.

The relevant integration code is:

1. [Set up translations in `messages/`](./messages/en.json)
2. [Set up `NextIntlProvider` in `src/pages/_app.tsx`](./src/pages/_app.tsx#L6)
3. [Provide messages in `src/pages/index.tsx`](./src/pages/index.tsx#L20)
4. [Use translations in `src/pages/index.tsx`](./src/pages/index.tsx#L7)

You can run the example locally like this:

```
yarn install
yarn dev
```
