# RFC: Automatic tree-shaking of messages

Start date: 2026-02-06

## Summary

This RFC proposes automatic tree-shaking of messages for Client Components in Next.js App Router applications. By statically analyzing the module graph, we can automatically determine which message namespaces (and ideally which keys) each client boundary requires, eliminating the need for manual namespace management with `pick()`.

This document describes the problem, motivation, and design considerations for implementing automatic message tree-shaking.

**Table of contents:**

- [Problem description](#problem-description)
  - [Background: How messages flow today](#background-how-messages-flow-today)
  - [The manual workaround](#the-manual-workaround)
  - [The goal: automatic namespace inference](#the-goal-automatic-namespace-inference)
  - [Static analysis requirements](#static-analysis-requirements)
  - [Entry point model](#entry-point-model)
  - [Existing infrastructure](#existing-infrastructure)
  - [Open questions](#open-questions)

## Problem description

### Background: How messages flow today

In Next.js App Router applications using `next-intl`, messages flow differently depending on where they're consumed:

**Server Components** read messages directly from `i18n/request.ts`. These messages are never serialized to the client bundle, so there's no bundle size concern for server-only code.

**Client Components** require messages to be delivered via `NextIntlClientProvider`, which serializes them across the React Server Components (RSC) bridge. By default, if the `messages` prop is omitted, `NextIntlClientProvider` inherits **all** messages by default. This means the entire message catalog gets serialized to the client bundle, even if only a small subset of namespaces is actually used.

For example, consider this layout:

```tsx
// app/[locale]/layout.tsx
export default async function LocaleLayout({children}: LayoutProps) {
  return (
    <NextIntlClientProvider>
      <Navigation />
      {children}
    </NextIntlClientProvider>
  );
}
```

In this case, we're passing the messages for all pages to the client (including the server-only ones). This creates unnecessary bundle size overhead.

### The manual workaround

Users can manually scope messages using `pick()` from lodash or similar utilities:

```tsx
import pick from 'lodash/pick';
import {NextIntlClientProvider, useMessages} from 'next-intl';
import Counter from './Counter';

export default function Page() {
  const messages = useMessages();

  return (
    <NextIntlClientProvider
      messages={
        // Only provide the minimum of messages
        pick(messages, 'Counter')
      }
    >
      <Counter />
    </NextIntlClientProvider>
  );
}
```

This approach works, but comes with significant drawbacks:

1. **Tedious to maintain**: Developers must manually identify which namespaces each subtree of client components needs. This requires understanding the transitive dependencies of all child components.
2. **Fragile**: It's easy to forget adding a namespace when a new `useTranslations` call is added deep in the component tree. Conversely, it's easy to leave stale namespaces when refactoring removes dependencies.
3. **Requires wrapper components**: Every client boundary that consumes translations needs a wrapper component that calls `pick()`. This adds boilerplate and can clutter the component hierarchy.
4. **Doesn't compose well**: If a client component renders other client components from different namespaces, the parent must know about all transitive namespace dependencies. This violates encapsulation and makes components harder to refactor.
5. **No key-level optimization**: Even with namespace-level filtering, all keys within a namespace are included, even if only a subset is used.

### The goal: automatic namespace inference

The ideal solution would automatically determine which message namespaces (and ideally which keys) each entry point's client boundary requires, ensuring users never over- or underfetch messages.

This would enable an API like:

```tsx
<NextIntlClientProvider messages="infer">
  {/* Automatically includes only namespaces used by this subtree */}
  <ClientComponent />
</NextIntlClientProvider>
```

Or even better, the inference could happen automatically without any explicit opt-in, making the developer experience seamless.

### Static analysis requirements

To implement automatic tree-shaking, we need to statically analyze the codebase and identify which messages are reachable from each client boundary. This analysis must handle several patterns:

#### Static namespace + static key

```tsx
const t = useTranslations('About');
t('title');
```

**Requirement**: Need `About.title` specifically.

#### Static namespace + dynamic key

```tsx
const t = useTranslations('About');
t(keyName); // where keyName is a variable
```

**Requirement**: Need all keys within `About.*` namespace (conservative approach).

#### No namespace

```tsx
const t = useTranslations();
t('someKey');
```

**Requirement**: Requires key-level analysis to determine which keys are used.

#### `useExtracted` / `getExtracted`

```tsx
const t = useExtracted();
t('Hey there!');
```

**Requirement**: The key is auto-generated via SHA-512 hash (first 6 characters of base64-encoded hash), see [`key_generator.rs`](../packages/swc-plugin-extractor/src/key_generator.rs).

The analysis must:

1. Generate the same key that the SWC plugin would generate
2. Determine which namespace the extracted message belongs to (if any was provided)
3. Include the generated key in the required messages

#### Hooks

`useTranslations` can be called inside custom hooks, not just components:

```tsx
function useCustomHook() {
  const t = useTranslations('MyNamespace');
  return t('someKey');
}
```

**Requirement**: The analysis must follow the call graph transitively, tracking `useTranslations` calls in hooks that are imported by client components.

### Entry point model

Next.js has well-defined entry points in the App Router:

- `page.tsx` - Page components
- `layout.tsx` - Layout components
- `loading.tsx` - Loading UI
- `template.tsx` - Template components
- `default.tsx` - Parallel route defaults
- `not-found.tsx` - Not found pages

Each entry point can contain `'use client'` boundaries that create separate client bundles. Tree-shaking needs to determine, per client boundary, which namespaces are reachable from the module graph rooted at that boundary.

**Server-only code** doesn't need tree-shaking since messages are never sent to the client. The analysis should only consider code paths that lead to client components.

**Multiple client boundaries** may exist in a single entry point (e.g., a layout that renders multiple client components). Each boundary should ideally receive only the messages it needs, though in practice, we may need to union all namespaces used by any client component within an entry point.

Separately, there's `error.tsx` which **must** be a Client Component (so the only place where its messages can be provided is in a ancestor layout).

### Open questions

Several design decisions need to be made before implementation:

1. **Build integration**: Should this run as part of the Next.js build process (via a plugin/loader), or as a separate sidecar process?
2. **Development vs production**: Is this optimization needed in development mode, or only in production builds? Development mode could use the full message catalog for simplicity, while production builds would benefit from tree-shaking. However, having different behavior between dev and prod could lead to bugs that only surface in production.
3. **Consumer API**: What API should consumers use to opt in? Options include:
   - `<NextIntlClientProvider messages="infer" />` - Explicit opt-in
   - Automatic inference by default, but this is difficult in case users annotate an entry point like `page.tsx` directly with `'use client'` (where would `NextIntlClientProvider` be placed then?)
   - Configuration flag in `next.config.ts` - Global opt-in/opt-out
4. **Simplicity**: Would it make sense to ship with an intermediate step where we at least remove all server messages and pass the remaining client ones in a shared layout? (similar to how we do it currently)
