# next-intl Playground

A demo site that documents `next-intl` patterns. Built on Next.js 15 with locale-prefixed routes (`/[locale]/...`) and Code Hike for code samples.

## Develop

```bash
pnpm --filter playground dev
```

Open http://localhost:3000.

## Test

```bash
pnpm --filter playground e2e
```

## Add a new page

1. Create `src/app/[locale]/<category>/<page>/page.tsx`, `content.mdx`, and a live demo component.
2. Add an entry to `src/lib/nav.ts`.
3. Add string keys to `messages/{en,de}.json`.

See existing examples under `src/app/[locale]/translations/`.
