# Tree-shaking: Provider placement constraint

## Root cause of prerender failures

When moving `NextIntlClientProvider messages="infer"` from layouts into pages (client components), the build fails with opaque prerender errors.

## Why it fails

**`messages="infer"` only works when the provider is rendered from a Server Component.**

1. **Package exports**: `next-intl` uses React's `"react-server"` export condition. When a **Server Component** imports `NextIntlClientProvider`, it receives `NextIntlClientProviderServer` (async) which:
   - Calls `getLocale()` for locale
   - Resolves messages via `__inferredManifest` (injected by manifest loader)
   - Passes resolved props to the base provider

2. **Client Component boundary**: When a **Client Component** (e.g. page with `'use client'`) imports `NextIntlClientProvider`, it receives the base `NextIntlClientProvider` directly. No server resolution runs. The provider gets:
   - `locale`: undefined (no `getLocale()` call)
   - `messages`: `'infer'` (never resolved)

3. **Result**: The base provider throws:
   - Dev: `"Couldn't infer the locale prop"` or `"messages='infer' can only be resolved in a Server Component"`
   - Prod: `new Error(undefined)` → opaque digest

## Constraint

**Providers with `messages="infer"` must live in Server Components** (layouts, or server component pages). They cannot be moved into Client Components.

## Implications for "each page has its own provider"

To have per-page providers with `messages="infer"`, the **page file must remain a Server Component** (no `'use client'`). It can be a thin wrapper:

```tsx
// page.tsx (no 'use client' - Server Component)
import {NextIntlClientProvider} from 'next-intl';
import PageContent from './PageContent';

export default function Page() {
  return (
    <NextIntlClientProvider messages="infer">
      <PageContent />
    </NextIntlClientProvider>
  );
}
```

Where `PageContent` is a Client Component (`'use client'`) that uses `useExtracted` etc. This works because the provider is in a Server Component. **group-one** and **group-two** use this pattern and build successfully.

The prerender failures occurred when we added `'use client'` to the **page** itself (e.g. feed/page, loading/loading, (home)/page). That made the whole page a Client Component. The provider was then rendered in a client context → no server resolution → `locale` undefined → throw.

## Summary

| Pattern | Works? |
|---------|--------|
| Layout (Server) → Provider → Page (Client) | ✓ |
| Page (Server) → Provider → PageContent (Client) | ✓ |
| Page (Client with 'use client') → Provider | ✗ |
