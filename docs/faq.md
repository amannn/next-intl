# FAQ

## What trade-offs does this library make?

1. The bundle size comes in at [36.1kb (10.5kb gzipped)](https://bundlephobia.com/result?p=next-intl) which is the tradeoff that's necessary for supporting all the mentioned internationalisation features. There are smaller libraries for internationalisation, but they typically cover less features than Format.JS. However if your performance budget doesn't allow for the size of this library, you might be better off with an alternative.
2. All relevant translations for the components need to be supplied to the provider – there's no concept of lazy loading translations. If your app has a significant number of messages, the page-based approach of Next.js allows you to only provide the minimum of necessary messages based on the route. If you split your components by features, it might make sense to split your translation files the same way to provide bundles per feature set. It might be possible for this library to support automatic tree-shaking of messages in the future (see [#1](https://github.com/amannn/next-intl/issues/1)).

## How is this library different from using `react-intl`?

1. This library is built around the concept of namespaces and that components consume a single namespace.
2. This library offers only a hooks-based API for message consumption. The reason for this is that the same API can be used for attributes as well as `children`.
3. This library doesn't use message descriptions, which could make it harder for translaters to localize messages. Related to this, AST-based extraction from `react-intl` is not possible. This library might be more reasonable for apps where the developer sets up translations based on a design for example whereas `react-intl` is targeted at really large projects with a multitude of languages.
4. This library is a bit smaller in size ([next-intl](https://bundlephobia.com/result?p=next-intl) vs [react-intl](https://bundlephobia.com/result?p=react-intl) on BundlePhobia).

## Can this be used without Next.js?

Yes, see [`use-intl`](../packages/use-intl).

## How can I parse dates or manipulate them?

This library is only concerned with formatting dates. A great library to parse and manipulate dates is [date-fns](https://date-fns.org/).
