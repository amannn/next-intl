# example-remix

An example that showcases a basic installation of `use-intl` in a [Remix app](https://remix.run/) based on the `accept-language` header.

The relevant integration code is:

1. [Set up translations in `messages/`](./messages/en.json)
2. [Resolve the user locale based on the `accept-language` header and fetch the relevant messages in `app/root.tsx`](./app/root.tsx#L17)
3. [Set up `IntlProvider` in `app/root.tsx`](./app/root.tsx#L38)
4. [Use translations in `app/routes/index.tsx`](./app/routes/index.tsx#L4)

You can run the example locally like this:

```
npm install
npm run dev
```
