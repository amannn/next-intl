# RFC: Automatic tree-shaking of messages

Start date: 2026-02-06

## Summary

We want Next.js App Router client bundles to receive only the message namespaces (and ideally keys) they actually use. Static analysis of the module graph can infer those requirements automatically, replacing manual `pick()` calls. This RFC frames the problem, the requirements for analysis, design options, and the proposed segment-level solution.

**Table of contents:**

- [Context](#context)
  - [How messages flow today](#how-messages-flow-today)
  - [Manual workaround](#manual-workaround)
- [Goal](#goal)
- [Static analysis requirements](#static-analysis-requirements)
- [Entry point model](#entry-point-model)
- [Design options for granularity](#design-options-for-granularity)
- [Proposed approach: Segment-level tree-shaking](#proposed-approach-segment-level-tree-shaking)
  - [Constraints](#constraints)
  - [Scope of analysis](#scope-of-analysis)
  - [Why this granularity](#why-this-granularity)
- [Alternatives and complements](#alternatives-and-complements)
- [Known limitations](#known-limitations)
- [Open questions](#open-questions)

## Context

### How messages flow today

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

### Manual workaround

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

## Goal

The ideal solution would automatically determine which message namespaces (and ideally which keys) each entry point's client boundary requires, ensuring users never over- or underfetch messages.

This would enable an API like:

```tsx
<NextIntlClientProvider messages="infer">
  {/* Automatically includes only namespaces used by this subtree */}
  <ClientComponent />
</NextIntlClientProvider>
```

Or even better, the inference could happen automatically without any explicit opt-in, making the developer experience seamless.

## Static analysis requirements

To implement automatic tree-shaking, we need to statically analyze the codebase and identify which messages are reachable from each client boundary. This analysis must handle several patterns:

### Static namespace + static key

```tsx
const t = useTranslations('About');
t('title');
```

**Requirement**: Need `About.title` specifically.

### Static namespace + dynamic key

```tsx
const t = useTranslations('About');
t(keyName); // where keyName is a variable
```

**Requirement**: Need all keys within `About.*` namespace (conservative approach).

### No namespace

```tsx
const t = useTranslations();
t('someKey');
```

**Requirement**: Requires key-level analysis to determine which keys are used.

### `useExtracted` / `getExtracted`

```tsx
const t = useExtracted();
t('Hey there!');
```

**Requirement**: The key is auto-generated via SHA-512 hash (first 6 characters of base64-encoded hash), see [`key_generator.rs`](../packages/swc-plugin-extractor/src/key_generator.rs).

The analysis must:

1. Generate the same key that the SWC plugin would generate
2. Determine which namespace the extracted message belongs to (if any was provided)
3. Include the generated key in the required messages

### Translator method variants

The translator function returned by `useTranslations` has several methods that also need to be analyzed:

```tsx
const t = useTranslations('About');
t('title'); // Standard translation
t.rich('title'); // Rich text with React components
t.markup('title'); // HTML markup
t.has('title'); // Check if key exists
t.raw('title'); // Get raw message value
```

**Requirement**: All these method calls must be tracked. `t.rich`, `t.markup`, and `t.has` still require the message to be available, so they contribute to the namespace requirements. `t.raw` is less common but should also be tracked.

### Hooks

`useTranslations` can be called inside custom hooks, not just components:

```tsx
function useCustomHook() {
  const t = useTranslations('MyNamespace');
  return t('someKey');
}
```

**Requirement**: The analysis must follow the call graph transitively, tracking `useTranslations` calls in hooks that are imported by client components.

### Module graph traversal

The analysis must traverse the module dependency graph to find all `useTranslations` / `useExtracted` calls reachable from client components. This includes:

- **Static imports**: `import {Component} from './Component'` - follow these transitively
- **Dynamic imports**: `const Component = await import('./Component')`, `React.lazy(() => import('./Component'))`, or `next/dynamic(() => import('./Component'))` - these need special handling since the module path is known but the import happens at runtime. `next/dynamic` is Next.js's wrapper around `React.lazy()` that provides additional features like disabling SSR (`ssr: false`), but still uses the same dynamic `import()` syntax under the hood
- **Re-exports**: `export {Component} from './Component'` - follow through re-export chains

For dynamic imports, the module path is statically analyzable (it's a string literal), so the analysis can still follow these imports. However, code-split boundaries created by `React.lazy` or dynamic `import()` may need to be handled conservatively -- if a namespace is used in a dynamically imported component, it should be included in the parent segment's message set.

### Monorepos and dependencies

In monorepo setups or when analyzing dependencies, the analysis may need to traverse into `node_modules` to find `useTranslations` calls in shared packages or workspace dependencies.

**Requirement**: The analysis should support analyzing code in:

- The application source directory (typically `src/` or `app/`)
- Workspace packages in monorepos (e.g., `packages/shared-components/`)
- Dependencies in `node_modules` that are part of the client bundle (though this is less common)

This is closely related to `experimental.srcPath` configuration, we should utilize this for tree shaking as well. Traversal of `node_modules` should be optional and configurable.

## Entry point model

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

## Design options for granularity

### Approach 1: Global client namespace filtering

Place a single provider in the root layout. At build time, scan the entire codebase to determine which namespaces are used by any client component anywhere in the app. Strip all server-only namespaces from the messages passed to the provider.

This is the simplest approach. It requires no module graph analysis per route -- just a global scan of all files to build a single set of "client namespaces." For apps where the majority of namespaces are server-only, this already eliminates a significant amount of unnecessary client payload. However, if 10 pages each use a different client namespace, every page still receives all 10.

### Approach 2: Per-entry-point splitting

Treat each Next.js entry point (`page.tsx`, `loading.tsx`, `error.tsx`, `template.tsx`) as a separate unit. Analyze each independently and provide tailored messages to each one.

This is unnecessarily granular. These entry points never render separately in a way that would benefit from separate message sets -- `loading.tsx` shows while `page.tsx` is loading, `error.tsx` replaces `page.tsx` on failure. Splitting between them adds complexity without practical benefit. Furthermore, `error.tsx` **must** be a Client Component, so it can't have its own provider -- it depends on an ancestor layout for messages.

### Approach 3: Segment-level splitting (proposed)

**This is the approach we're pursuing.** A _segment_ is a route-folder. All entry points inside (`page.tsx`, `loading.tsx`, `error.tsx`, `template.tsx`) belong to the same unit. We place the provider in the segment's `layout.tsx` (which Next.js treats as the shared wrapper) and infer the union of namespaces reachable from any client component in that segment's scope.

## Proposed approach: Segment-level tree-shaking

### Constraints

1. The provider (e.g. `<NextIntlClientProvider messages="infer" />`) lives in `layout.tsx` of the segment.
2. That layout stays a Server Component (no `'use client'`) so it can render the provider with serialized messages.

### Scope of analysis

For a layout with `messages="infer"` at path `P`, analyze:

1. The layout's own client children (e.g. `<Navigation />`).
2. All entry points in the same segment (`page.tsx`, `loading.tsx`, `error.tsx`, `template.tsx` at path `P`).
3. Descendant segments until a nested layout with `messages="infer"` is encountered (that nested layout takes ownership of its subtree).

For each reachable client boundary, traverse the module graph starting at `'use client'` files and collect `useTranslations` / `useExtracted` calls. The union of required namespaces for the segment is passed to the provider.

### Why this granularity

- Segments are the unit Next.js already groups for routing; entry points inside don’t benefit from distinct message sets.
- `error.tsx` is naturally covered because it shares the layout.
- Avoids over-splitting while still allowing progressive refinement via nested layouts; a single root layout collapses back to the global-filter approach.

#### Example:

**Example:**

```
app/[locale]/
  layout.tsx        → messages="infer" (scope: Navigation + Index + About)
  page.tsx          → client components use: Index
  about/
    page.tsx        → client components use: About
  dashboard/
    layout.tsx      → messages="infer" (scope: Dashboard + Settings)
    page.tsx        → client components use: Dashboard
    settings/
      page.tsx      → client components use: Settings
```

- The root layout provides `Navigation`, `Index`, and `About` namespaces (since `about/` has no layout with `messages="infer"`, it falls under the root layout's scope).
- The dashboard layout provides `Dashboard` and `Settings` namespaces (carving off its subtree from the root layout's scope).
- When navigating from `/` to `/about`, the root layout's messages already include `About` -- no additional messages needed.
- When navigating to `/dashboard`, the dashboard layout provides its own, more specific set.

## Open questions

Several design decisions need to be made before implementation:

1. **Build integration**: SWC/plugin in Next.js vs separate sidecar; how to cache module graph results for fast rebuilds?
2. **Development vs production**: Dev full catalog vs dev inference—how to surface missing-message regressions before prod?
3. **Consumer API**: Final shape of opt-in (`messages="infer"`), and explicit escape-hatch semantics when `messages` is provided manually.
4. **Pages router support**: How to handle Pages Router? (if at all)

