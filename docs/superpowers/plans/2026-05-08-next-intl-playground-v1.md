# next-intl Playground v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the v1 of the new `playground/` app on PR #2084 — Translations category with Server Components and Client Components detail pages, MDX content rendered through Code Hike, locale-prefixed routing, and the Vercel-app-router-playground-style chrome polished against amannn's design system.

**Architecture:** Next.js 15 App Router app under `playground/`, locale-prefixed routes (`/[locale]/...`) with `next-intl/middleware`. Each detail page is a TSX shell that imports a sibling `content.mdx` (rich prose + Code Hike-annotated code samples) plus a live demo component. Code Hike runs at build time via `remarkCodeHike` + `recmaCodeHike`; fenced code blocks resolve to a custom `<Code>` RSC that calls `highlight()` and renders `<Pre handlers={...}/>`.

**Tech Stack:** Next.js 15, React 19, `next-intl@latest`, `codehike@1`, `@next/mdx`, Tailwind v4 (already wired), `next-themes`, Lucide icons, shadcn/ui primitives.

**Working branch:** `docs/refactor-playground` (already exists; current state has chrome but no MDX/Code Hike/i18n).

**Verification model:** UI-heavy work doesn't get traditional unit tests. We rely on:
1. `pnpm --filter playground tsc --noEmit` after each task (typecheck)
2. `pnpm --filter playground build` after each phase (build)
3. `pnpm --filter playground lint` after each phase (lint)
4. Manual browser walkthrough at the end of each phase
5. A small Playwright smoke test added in the final phase

---

## File Structure

This plan produces (or modifies) the following layout. Square brackets indicate files that already exist on the branch and will be modified or replaced:

```
playground/
├── next.config.ts                     [modify]      # add MDX + Code Hike plugins
├── package.json                        [modify]      # add deps
├── mdx-components.tsx                  [create]
├── messages/
│   ├── en.json                         [create]
│   └── de.json                         [create]
├── src/
│   ├── middleware.ts                   [create]
│   ├── i18n/
│   │   ├── routing.ts                  [create]
│   │   ├── request.ts                  [create]
│   │   └── navigation.ts               [create]
│   ├── app/
│   │   ├── globals.css                 [modify]      # add code-theme CSS vars
│   │   ├── [locale]/
│   │   │   ├── layout.tsx              [move+modify] # adds NextIntlClientProvider, setRequestLocale
│   │   │   ├── page.tsx                [move+modify] # landing
│   │   │   └── translations/
│   │   │       ├── server-components/
│   │   │       │   ├── page.tsx        [replace]     # TSX shell only
│   │   │       │   ├── content.mdx     [create]
│   │   │       │   ├── server-example.tsx [modify]
│   │   │       │   └── README.md       [keep]
│   │   │       └── client-components/
│   │   │           ├── page.tsx        [replace]
│   │   │           ├── content.mdx     [create]
│   │   │           ├── client-example.tsx [modify]
│   │   │           └── README.md       [keep]
│   ├── components/
│   │   ├── code/
│   │   │   ├── code.tsx                [create]      # <Code> RSC
│   │   │   └── annotations/
│   │   │       ├── index.ts            [create]
│   │   │       ├── filename.tsx        [create]
│   │   │       ├── mark.tsx            [create]
│   │   │       ├── callout.tsx         [create]
│   │   │       ├── focus.tsx           [create]
│   │   │       ├── focus.client.tsx    [create]
│   │   │       ├── link.tsx            [create]
│   │   │       ├── fold.tsx            [create]
│   │   │       └── line-numbers.tsx    [create]
│   │   ├── playground/
│   │   │   ├── sidebar.tsx             [move+modify] # from app/_components/playground-sidebar.tsx
│   │   │   ├── byline.tsx              [move]
│   │   │   ├── boundary.tsx            [move]
│   │   │   ├── client-providers.tsx    [move+modify] # add NextIntlClientProvider
│   │   │   ├── github-link.tsx         [move+modify]
│   │   │   ├── link-status.tsx         [move]
│   │   │   ├── locale-switcher.tsx     [create]
│   │   │   ├── theme-toggle.tsx        [move]
│   │   │   ├── two-column.tsx          [create]
│   │   │   └── demo-card.tsx           [create]      # replaces ad-hoc demo-content
│   │   └── ui/
│   │       ├── button.tsx              [keep]
│   │       ├── scroll-area.tsx         [keep]
│   │       ├── badge.tsx               [create]
│   │       └── dropdown-menu.tsx       [create]      # for locale switcher
│   ├── lib/
│   │   ├── nav.ts                      [move+modify] # was app/assets/navigations.ts
│   │   └── utils.ts                    [keep]
│   └── assets/
│       └── logo.tsx                    [move]
├── tests/
│   └── playground.spec.ts              [create]      # Playwright smoke
└── playwright.config.ts                [create]
```

Files under the existing `playground/src/app/_components/` and `playground/src/app/assets/` get **moved** into `src/components/playground/` and `src/lib/` respectively, so layout chrome and content code live in canonical locations.

---

## Phase A — Foundation (deps, MDX, i18n, restructure)

### Task A1: Install dependencies

**Files:**
- Modify: `playground/package.json`
- Modify: `pnpm-lock.yaml` (auto)

- [ ] **Step 1: Add runtime deps**

In `playground/package.json`, add to `dependencies`:
```json
"@next/mdx": "^15.5.4",
"@mdx-js/loader": "^3.1.0",
"@mdx-js/react": "^3.1.0",
"@radix-ui/react-dropdown-menu": "^2.1.6",
"next-intl": "^4.9.1",
"zod": "^3.24.1"
```

And to `devDependencies`:
```json
"@types/mdx": "^2.0.13",
"@playwright/test": "^1.50.0"
```

- [ ] **Step 2: Install**

Run from repo root:
```bash
pnpm install
```

Expected: lockfile updates, no peer-dep errors.

- [ ] **Step 3: Verify**

```bash
pnpm --filter playground tsc --noEmit
```
Expected: PASS (no compile errors yet — nothing changed in code).

- [ ] **Step 4: Commit**

```bash
git add playground/package.json pnpm-lock.yaml
git commit -m "chore(playground): add MDX, Code Hike consumers, next-intl deps"
```

---

### Task A2: Wire `@next/mdx` + Code Hike in `next.config.ts`

**Files:**
- Modify: `playground/next.config.ts`

- [ ] **Step 1: Replace config**

```ts
// playground/next.config.ts
import type { NextConfig } from 'next';
import createMDX from '@next/mdx';
import { remarkCodeHike, recmaCodeHike, type CodeHikeConfig } from 'codehike/mdx';
import createNextIntlPlugin from 'next-intl/plugin';

const chConfig: CodeHikeConfig = {
  components: { code: 'Code' },
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [[remarkCodeHike, chConfig]],
    recmaPlugins: [[recmaCodeHike, chConfig]],
    jsx: true,
  },
});

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
};

export default withNextIntl(withMDX(nextConfig));
```

- [ ] **Step 2: Build**

```bash
pnpm --filter playground build
```
Expected: build succeeds (request.ts doesn't exist yet, but `createNextIntlPlugin` doesn't validate at config load — only at runtime). If it fails citing missing `request.ts`, comment out the `withNextIntl` wrapper and re-add it in Task A4.

- [ ] **Step 3: Commit**

```bash
git add playground/next.config.ts
git commit -m "feat(playground): configure @next/mdx and Code Hike plugins"
```

---

### Task A3: Create `mdx-components.tsx`

**Files:**
- Create: `playground/mdx-components.tsx`

- [ ] **Step 1: Write the file**

```tsx
// playground/mdx-components.tsx
import type { MDXComponents } from 'mdx/types';
import { Code } from '@/components/code/code';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { Code, ...components };
}
```

- [ ] **Step 2: Stub `<Code>`**

To unblock typecheck before Phase B builds the real `<Code>`, create a stub:

```tsx
// playground/src/components/code/code.tsx
import type { RawCode } from 'codehike/code';

export function Code({ codeblock }: { codeblock: RawCode }) {
  return <pre><code>{codeblock.value}</code></pre>;
}
```

- [ ] **Step 3: Typecheck**

```bash
pnpm --filter playground tsc --noEmit
```
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add playground/mdx-components.tsx playground/src/components/code/code.tsx
git commit -m "feat(playground): wire MDX components map with stub <Code>"
```

---

### Task A4: i18n routing primitives

**Files:**
- Create: `playground/src/i18n/routing.ts`
- Create: `playground/src/i18n/request.ts`
- Create: `playground/src/i18n/navigation.ts`
- Create: `playground/src/middleware.ts`
- Create: `playground/messages/en.json`
- Create: `playground/messages/de.json`

- [ ] **Step 1: routing.ts**

```ts
// playground/src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'de'],
  defaultLocale: 'en',
});
```

- [ ] **Step 2: request.ts**

```ts
// playground/src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

- [ ] **Step 3: navigation.ts**

```ts
// playground/src/i18n/navigation.ts
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

- [ ] **Step 4: middleware.ts**

```ts
// playground/src/middleware.ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all paths except API, _next, files with extensions
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
```

- [ ] **Step 5: messages**

```json
// playground/messages/en.json
{
  "Layout": {
    "title": "next-intl Playground",
    "tagline": "Translations, formatting, routing, and patterns with Next.js."
  },
  "Nav": {
    "translations": "Translations",
    "serverComponents": "Server components",
    "clientComponents": "Client components"
  },
  "ServerDemo": {
    "title": "Server Components",
    "greeting": "Hello, world!"
  },
  "ClientDemo": {
    "title": "Client Components",
    "label": "Your name",
    "placeholder": "Frodo",
    "greeting": "Hello, {name}!"
  }
}
```

```json
// playground/messages/de.json
{
  "Layout": {
    "title": "next-intl Playground",
    "tagline": "Übersetzungen, Formatierung, Routing und Patterns mit Next.js."
  },
  "Nav": {
    "translations": "Übersetzungen",
    "serverComponents": "Server-Komponenten",
    "clientComponents": "Client-Komponenten"
  },
  "ServerDemo": {
    "title": "Server-Komponenten",
    "greeting": "Hallo, Welt!"
  },
  "ClientDemo": {
    "title": "Client-Komponenten",
    "label": "Dein Name",
    "placeholder": "Frodo",
    "greeting": "Hallo, {name}!"
  }
}
```

- [ ] **Step 6: Typecheck**

```bash
pnpm --filter playground tsc --noEmit
```
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add playground/src/i18n playground/src/middleware.ts playground/messages
git commit -m "feat(playground): set up next-intl routing and message catalogs"
```

---

### Task A5: Restructure `app/` to `app/[locale]/`

**Files:**
- Move: `playground/src/app/layout.tsx` → `playground/src/app/[locale]/layout.tsx`
- Move: `playground/src/app/page.tsx` → `playground/src/app/[locale]/page.tsx`
- Move: `playground/src/app/translations/` → `playground/src/app/[locale]/translations/`
- Delete: `playground/src/app/translations/server-components/[locale]/` (empty leftover)
- Delete: `playground/src/app/translations/client-components/[locale]/` (empty leftover)
- Create: `playground/src/app/layout.tsx` (root, minimal)
- Modify: `playground/src/app/[locale]/layout.tsx` (add `setRequestLocale`, provider)

- [ ] **Step 1: Move files**

```bash
cd playground/src/app
git mv layout.tsx [locale]/layout.tsx
git mv page.tsx [locale]/page.tsx
git mv translations [locale]/translations
git rm -r [locale]/translations/server-components/\[locale\]
git rm -r [locale]/translations/client-components/\[locale\]
cd -
```

- [ ] **Step 2: Add minimal root layout**

`@next/mdx` requires a root `app/layout.tsx`. Create:

```tsx
// playground/src/app/layout.tsx
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
```

(The HTML/body wrapper lives in `[locale]/layout.tsx`.)

- [ ] **Step 3: Update `[locale]/layout.tsx`**

```tsx
// playground/src/app/[locale]/layout.tsx
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale, getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { ClientProviders } from '@/components/playground/client-providers';
import { PlaygroundSidebar } from '@/components/playground/sidebar';
import { PlaygroundByline } from '@/components/playground/byline';
import '../globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'next-intl Playground',
  description:
    'Explore translations, formatting, routing, and patterns with next-intl.',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`font-sans ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientProviders>
            <PlaygroundSidebar />
            <div className="lg:pl-72">
              <div className="mx-auto mt-12 mb-24 max-w-4xl -space-y-[1px] lg:px-8 lg:py-8">
                {children}
                <PlaygroundByline />
              </div>
            </div>
          </ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

This task imports from `@/components/playground/...` — those paths don't yet exist. Phase C moves them. Until then, `tsc --noEmit` will report missing modules. That's expected; Step 4 commits the WIP and we resolve in Phase C.

- [ ] **Step 4: Commit (WIP)**

```bash
git add playground
git commit -m "refactor(playground): move app routes under [locale] segment"
```

---

### Task A6: Move chrome components into canonical locations

**Files:**
- Move: `playground/src/app/_components/playground-sidebar.tsx` → `playground/src/components/playground/sidebar.tsx`
- Move: `playground/src/app/_components/playground-byline.tsx` → `playground/src/components/playground/byline.tsx`
- Move: `playground/src/app/_components/playground-boundary.tsx` → `playground/src/components/playground/boundary.tsx`
- Move: `playground/src/app/_components/client-providers.tsx` → `playground/src/components/playground/client-providers.tsx`
- Move: `playground/src/app/_components/github-link.tsx` → `playground/src/components/playground/github-link.tsx`
- Move: `playground/src/app/_components/link-status.tsx` → `playground/src/components/playground/link-status.tsx`
- Move: `playground/src/app/_components/theme-toggle.tsx` → `playground/src/components/playground/theme-toggle.tsx`
- Move: `playground/src/app/_components/demo-content.tsx` → delete (replaced by `demo-card.tsx` later)
- Move: `playground/src/app/assets/navigations.ts` → `playground/src/lib/nav.ts`
- Move: `playground/src/app/assets/logo.tsx` → `playground/src/assets/logo.tsx`

- [ ] **Step 1: git mv each file**

```bash
cd playground
git mv src/app/_components/playground-sidebar.tsx src/components/playground/sidebar.tsx
git mv src/app/_components/playground-byline.tsx src/components/playground/byline.tsx
git mv src/app/_components/playground-boundary.tsx src/components/playground/boundary.tsx
git mv src/app/_components/client-providers.tsx src/components/playground/client-providers.tsx
git mv src/app/_components/github-link.tsx src/components/playground/github-link.tsx
git mv src/app/_components/link-status.tsx src/components/playground/link-status.tsx
git mv src/app/_components/theme-toggle.tsx src/components/playground/theme-toggle.tsx
git rm src/app/_components/demo-content.tsx
git mv src/app/assets/navigations.ts src/lib/nav.ts
git mv src/app/assets/logo.tsx src/assets/logo.tsx
rmdir src/app/_components src/app/assets
cd -
```

- [ ] **Step 2: Fix imports inside the moved files**

Each moved file used relative imports like `../assets/logo`, `./theme-toggle`, etc. Open each and rewrite imports to use the `@/...` alias. Specifically:

- `sidebar.tsx`: `import { Logo } from '@/assets/logo'`, `import { sections } from '@/lib/nav'`, `import { ThemeToggle } from './theme-toggle'`, `import { LinkStatus } from './link-status'`
- `byline.tsx`: typically self-contained — open and verify
- `boundary.tsx`: self-contained — verify
- `github-link.tsx`: self-contained — verify
- `client-providers.tsx`: self-contained — verify

For each file, replace `from '../...'` with the `@/...` form. The `@` alias already maps to `playground/src/` per `tsconfig.json`.

- [ ] **Step 3: Add export name correction**

`byline.tsx` currently exports default; the new layout (`[locale]/layout.tsx`) imports `{ PlaygroundByline }`. Change the existing default export to a named export:

```tsx
// at the top of the function:
export function PlaygroundByline() { /* ... existing body ... */ }
```

Remove the `export default ...` line at the bottom.

- [ ] **Step 4: Typecheck**

```bash
pnpm --filter playground tsc --noEmit
```
Expected: PASS, modulo the not-yet-created components used by sidebar (locale switcher etc.) and the ones referenced from MDX. If errors mention a module that's planned later in this plan, leave them — they'll resolve. Anything else, fix now.

- [ ] **Step 5: Commit**

```bash
git add playground
git commit -m "refactor(playground): move chrome components to src/components/playground"
```

---

### Task A7: Update `client-providers.tsx` to be locale-agnostic

**Files:**
- Modify: `playground/src/components/playground/client-providers.tsx`

The existing file wraps with `next-themes`. We want to keep it client-only and *not* duplicate `NextIntlClientProvider` (which we mounted in the locale layout).

- [ ] **Step 1: Open the file and confirm it's already just a `next-themes` wrapper.**

If it includes any locale logic, remove it. Final form:

```tsx
'use client';

import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}
```

- [ ] **Step 2: Typecheck + Commit**

```bash
pnpm --filter playground tsc --noEmit
git add playground/src/components/playground/client-providers.tsx
git commit -m "refactor(playground): keep client providers as a pure theme wrapper"
```

---

### Task A8: Phase A verification

- [ ] **Step 1: Lint**

```bash
pnpm --filter playground lint
```
Expected: PASS (or only warnings on yet-unwritten files).

- [ ] **Step 2: Typecheck**

```bash
pnpm --filter playground tsc --noEmit
```
Expected: errors only on Code Hike `<Code>` (still stubbed) and Phase C files. No errors related to MDX/i18n/restructure.

- [ ] **Step 3: Dev server smoke**

```bash
pnpm --filter playground dev
```
Open `http://localhost:3000/en` — should redirect (via middleware) and render the existing landing page. `http://localhost:3000/de` likewise. Stop the server.

- [ ] **Step 4: Commit if any fixups**

---

## Phase B — Code Hike `<Code>` and annotation handlers

### Task B1: `filename` annotation

**Files:**
- Create: `playground/src/components/code/annotations/filename.tsx`

- [ ] **Step 1: Write handler**

```tsx
// playground/src/components/code/annotations/filename.tsx
import type { AnnotationHandler } from 'codehike/code';

export const filename: AnnotationHandler = {
  name: 'filename',
  Pre: ({ annotation, ...rest }) => {
    // Filename comes from the codeblock's meta string, not an annotation.
    return null;
  },
};
```

This file ends up unused at runtime — filename rendering happens directly in `<Code>` from `codeblock.meta`. Skip the handler entirely; track filename in `code.tsx` itself instead.

Replace the file with:

```tsx
// playground/src/components/code/annotations/filename.tsx
// Filename is rendered as a header strip in Code.tsx using codeblock.meta.
// This file exists only as a placeholder so importers stay consistent.
export {};
```

- [ ] **Step 2: Commit**

```bash
git add playground/src/components/code/annotations/filename.tsx
git commit -m "feat(playground): scaffold filename header"
```

---

### Task B2: `mark` annotation

**Files:**
- Create: `playground/src/components/code/annotations/mark.tsx`

- [ ] **Step 1: Write handler**

```tsx
// playground/src/components/code/annotations/mark.tsx
import type { AnnotationHandler } from 'codehike/code';
import { InnerLine } from 'codehike/code';

export const mark: AnnotationHandler = {
  name: 'mark',
  Line: ({ annotation, ...props }) => {
    const color = annotation?.query || 'rgb(14 165 233)';
    return (
      <div
        className="flex"
        style={{
          borderLeft: 'solid 2px transparent',
          borderLeftColor: annotation && color,
          backgroundColor: annotation && `rgb(from ${color} r g b / 0.1)`,
        }}
      >
        <InnerLine merge={props} className="px-2 flex-1" />
      </div>
    );
  },
  Inline: ({ annotation, children }) => {
    const color = annotation?.query || 'rgb(14 165 233)';
    return (
      <span
        className="rounded px-0.5 py-0 -mx-0.5"
        style={{
          outline: `solid 1px rgb(from ${color} r g b / 0.5)`,
          background: `rgb(from ${color} r g b / 0.13)`,
        }}
      >
        {children}
      </span>
    );
  },
};
```

- [ ] **Step 2: Typecheck + Commit**

```bash
pnpm --filter playground tsc --noEmit
git add playground/src/components/code/annotations/mark.tsx
git commit -m "feat(playground): add mark annotation handler"
```

---

### Task B3: `callout` annotation

**Files:**
- Create: `playground/src/components/code/annotations/callout.tsx`

- [ ] **Step 1: Write handler**

```tsx
// playground/src/components/code/annotations/callout.tsx
import type { AnnotationHandler, InlineAnnotation } from 'codehike/code';

export const callout: AnnotationHandler = {
  name: 'callout',
  transform: (annotation: InlineAnnotation) => {
    const { name, query, lineNumber, fromColumn, toColumn, data } = annotation;
    return {
      name,
      query,
      fromLineNumber: lineNumber,
      toLineNumber: lineNumber,
      data: { ...data, column: (fromColumn + toColumn) / 2 },
    };
  },
  Block: ({ annotation, children }) => {
    const { column } = annotation.data as { column: number };
    return (
      <>
        {children}
        <div
          style={{ minWidth: `${column + 4}ch` }}
          className="w-fit border bg-card border-current rounded px-2 relative -ml-[1ch] mt-1 whitespace-break-spaces"
        >
          <div
            style={{ left: `${column}ch` }}
            className="absolute border-l border-t border-current w-2 h-2 rotate-45 -translate-y-1/2 -top-[1px] bg-card"
          />
          {annotation.query}
        </div>
      </>
    );
  },
};
```

- [ ] **Step 2: Typecheck + Commit**

```bash
pnpm --filter playground tsc --noEmit
git add playground/src/components/code/annotations/callout.tsx
git commit -m "feat(playground): add callout annotation handler"
```

---

### Task B4: `focus` annotation (server + client split)

**Files:**
- Create: `playground/src/components/code/annotations/focus.tsx`
- Create: `playground/src/components/code/annotations/focus.client.tsx`

- [ ] **Step 1: Server file**

```tsx
// playground/src/components/code/annotations/focus.tsx
import type { AnnotationHandler } from 'codehike/code';
import { InnerLine } from 'codehike/code';
import { PreWithFocus } from './focus.client';

export const focus: AnnotationHandler = {
  name: 'focus',
  onlyIfAnnotated: true,
  PreWithRef: PreWithFocus,
  Line: (props) => (
    <InnerLine
      merge={props}
      className="opacity-50 data-[focus]:opacity-100 px-2"
    />
  ),
  AnnotatedLine: ({ annotation, ...props }) => (
    <InnerLine merge={props} data-focus={true} className="bg-zinc-700/30" />
  ),
};
```

- [ ] **Step 2: Client file**

```tsx
// playground/src/components/code/annotations/focus.client.tsx
'use client';

import React, { useLayoutEffect, useRef } from 'react';
import type { AnnotationHandler } from 'codehike/code';
import { InnerPre, getPreRef } from 'codehike/code';

export const PreWithFocus: AnnotationHandler['PreWithRef'] = (props) => {
  const ref = getPreRef(props);
  useScrollToFocus(ref);
  return <InnerPre merge={props} />;
};

function useScrollToFocus(ref: React.RefObject<HTMLPreElement | null>) {
  const firstRender = useRef(true);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const focused = ref.current.querySelectorAll<HTMLElement>(
      '[data-focus=true]',
    );
    const containerRect = ref.current.getBoundingClientRect();
    let top = Infinity;
    let bottom = -Infinity;
    focused.forEach((el) => {
      const rect = el.getBoundingClientRect();
      top = Math.min(top, rect.top - containerRect.top);
      bottom = Math.max(bottom, rect.bottom - containerRect.top);
    });
    if (bottom > containerRect.height || top < 0) {
      ref.current.scrollTo({
        top: ref.current.scrollTop + top - 10,
        behavior: firstRender.current ? 'instant' : 'smooth',
      });
    }
    firstRender.current = false;
  }, [ref]);
}
```

- [ ] **Step 3: Typecheck + Commit**

```bash
pnpm --filter playground tsc --noEmit
git add playground/src/components/code/annotations/focus.tsx playground/src/components/code/annotations/focus.client.tsx
git commit -m "feat(playground): add focus annotation handler"
```

---

### Task B5: `link` annotation

**Files:**
- Create: `playground/src/components/code/annotations/link.tsx`

- [ ] **Step 1: Write handler**

```tsx
// playground/src/components/code/annotations/link.tsx
import type { AnnotationHandler } from 'codehike/code';

export const link: AnnotationHandler = {
  name: 'link',
  Inline: ({ annotation, children }) => (
    <a
      href={annotation.query}
      className="underline decoration-dotted underline-offset-4 hover:text-primary"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
};
```

- [ ] **Step 2: Typecheck + Commit**

```bash
pnpm --filter playground tsc --noEmit
git add playground/src/components/code/annotations/link.tsx
git commit -m "feat(playground): add link annotation handler"
```

---

### Task B6: `fold` annotation

**Files:**
- Create: `playground/src/components/code/annotations/fold.tsx`

Code Hike's `!fold` annotation collapses regex-matched substrings. Keep it minimal — render an ellipsis span for inline matches.

- [ ] **Step 1: Write handler**

```tsx
// playground/src/components/code/annotations/fold.tsx
import type { AnnotationHandler } from 'codehike/code';

export const fold: AnnotationHandler = {
  name: 'fold',
  Inline: () => (
    <span className="text-muted-foreground italic">…</span>
  ),
};
```

- [ ] **Step 2: Typecheck + Commit**

```bash
pnpm --filter playground tsc --noEmit
git add playground/src/components/code/annotations/fold.tsx
git commit -m "feat(playground): add fold annotation handler"
```

---

### Task B7: `lineNumbers` annotation

**Files:**
- Create: `playground/src/components/code/annotations/line-numbers.tsx`

- [ ] **Step 1: Write handler**

```tsx
// playground/src/components/code/annotations/line-numbers.tsx
import type { AnnotationHandler } from 'codehike/code';
import { InnerLine } from 'codehike/code';

export const lineNumbers: AnnotationHandler = {
  name: 'line-numbers',
  Line: (props) => {
    const { lineNumber, totalLines } = props;
    const width = String(totalLines).length;
    return (
      <div className="flex">
        <span
          className="text-right pr-3 select-none text-muted-foreground tabular-nums"
          style={{ width: `${width + 1}ch` }}
        >
          {lineNumber}
        </span>
        <InnerLine merge={props} className="flex-1" />
      </div>
    );
  },
};
```

- [ ] **Step 2: Typecheck + Commit**

```bash
pnpm --filter playground tsc --noEmit
git add playground/src/components/code/annotations/line-numbers.tsx
git commit -m "feat(playground): add line-numbers annotation handler"
```

---

### Task B8: Annotation index

**Files:**
- Create: `playground/src/components/code/annotations/index.ts`

- [ ] **Step 1: Write the barrel**

```ts
// playground/src/components/code/annotations/index.ts
export { mark } from './mark';
export { callout } from './callout';
export { focus } from './focus';
export { link } from './link';
export { fold } from './fold';
export { lineNumbers } from './line-numbers';
```

- [ ] **Step 2: Commit**

```bash
git add playground/src/components/code/annotations/index.ts
git commit -m "feat(playground): export annotation handlers from barrel"
```

---

### Task B9: Real `<Code>` RSC

**Files:**
- Modify: `playground/src/components/code/code.tsx`
- Modify: `playground/src/app/globals.css` (add `github-from-css` theme variables)

- [ ] **Step 1: Replace stub with real implementation**

```tsx
// playground/src/components/code/code.tsx
import { Pre, type RawCode, highlight } from 'codehike/code';
import { mark, callout, focus, link, fold, lineNumbers } from './annotations';

const handlers = [mark, callout, focus, link, fold, lineNumbers];

export async function Code({ codeblock }: { codeblock: RawCode }) {
  const highlighted = await highlight(codeblock, 'github-from-css');

  const filename = codeblock.meta;
  return (
    <div className="rounded-md border border-border bg-card overflow-hidden">
      {filename ? (
        <div className="px-3 py-1.5 text-xs font-mono uppercase tracking-wide text-muted-foreground border-b border-border bg-muted/40">
          {filename}
        </div>
      ) : null}
      <Pre
        code={highlighted}
        handlers={handlers}
        className="!bg-transparent !text-sm !leading-6 px-3 py-3 overflow-x-auto"
      />
    </div>
  );
}
```

- [ ] **Step 2: Add theme CSS variables**

Append to `playground/src/app/globals.css`:

```css
/* Code Hike — github-from-css theme variables */
:root {
  --ch-0: light;
  --ch-1: #6e7781;
  --ch-2: #0550ae;
  --ch-3: #953800;
  --ch-4: #24292f;
  --ch-5: #8250df;
  --ch-6: #116329;
  --ch-7: #cf222e;
  --ch-8: #0a3069;
  --ch-9: #82071e;
  --ch-10: #f6f8fa;
  --ch-11: #ffebe9;
  --ch-12: #ffd8b5;
  --ch-13: #eaeef2;
  --ch-14: #57606a;
  --ch-15: #ffffff;
  --ch-16: #eaeef2;
  --ch-17: #fdf2f8;
  --ch-18: #1f883d;
  --ch-19: #cf222e;
  --ch-20: #8250df;
  --ch-21: #fff8c5;
  --ch-22: #fbf0a4;
  --ch-23: #6e7781;
  --ch-24: #ffffffe6;
}

.dark {
  --ch-0: dark;
  --ch-1: #8b949e;
  --ch-2: #79c0ff;
  --ch-3: #ffa657;
  --ch-4: #c9d1d9;
  --ch-5: #d2a8ff;
  --ch-6: #7ee787;
  --ch-7: #ff7b72;
  --ch-8: #a5d6ff;
  --ch-9: #ffa198;
  --ch-10: #f0f6fc;
  --ch-11: #490202;
  --ch-12: #5a1e02;
  --ch-13: #161b22;
  --ch-14: #8b949e;
  --ch-15: #0d1117;
  --ch-16: #30363d;
  --ch-17: #261d2d;
  --ch-18: #56d364;
  --ch-19: #f85149;
  --ch-20: #d2a8ff;
  --ch-21: #5a1e02;
  --ch-22: #693e00;
  --ch-23: #8b949e;
  --ch-24: #1f6feb1a;
}
```

(These variable names match `lighter`'s `github-from-css` theme. If a future Code Hike version drifts, copy fresh values from `https://github.com/code-hike/lighter/blob/main/lib/themes/github-from-css.css`.)

- [ ] **Step 3: Build**

```bash
pnpm --filter playground build
```
Expected: PASS. Code Hike's `highlight` runs at request time; build will not exercise it unless a page already imports MDX. That's fine.

- [ ] **Step 4: Commit**

```bash
git add playground/src/components/code/code.tsx playground/src/app/globals.css
git commit -m "feat(playground): wire <Code> RSC with Code Hike highlight + theme"
```

---

## Phase C — Playground chrome

### Task C1: Sidebar nav refactor

**Files:**
- Modify: `playground/src/lib/nav.ts`
- Modify: `playground/src/components/playground/sidebar.tsx`

- [ ] **Step 1: Update `nav.ts` with categories that grow**

```ts
// playground/src/lib/nav.ts
import type { LucideIcon } from 'lucide-react';
import { Languages, Calculator, Route, Wrench } from 'lucide-react';

export type NavItem = {
  title: string;
  slug: string;
  description?: string;
  status?: 'available' | 'coming-soon';
};

export type NavSection = {
  title: string;
  icon: LucideIcon;
  items: NavItem[];
};

export const sections: NavSection[] = [
  {
    title: 'Translations',
    icon: Languages,
    items: [
      {
        title: 'Server components',
        slug: '/translations/server-components',
        description:
          'Read translated strings inside async Server Components — zero client JS.',
        status: 'available',
      },
      {
        title: 'Client components',
        slug: '/translations/client-components',
        description:
          'Use translations from Client Components for interactive content.',
        status: 'available',
      },
    ],
  },
  {
    title: 'Formatting',
    icon: Calculator,
    items: [],
  },
  {
    title: 'Routing',
    icon: Route,
    items: [],
  },
  {
    title: 'Patterns',
    icon: Wrench,
    items: [],
  },
];
```

(Empty categories appear in the sidebar dimmed; they reserve the future structure.)

- [ ] **Step 2: Update `sidebar.tsx`**

Open the current file and apply these changes:
1. Import sections from `@/lib/nav` (already done in Task A6).
2. Use `useTranslations` from `next-intl` for the "Playground" title and tagline.
3. Render empty categories with reduced opacity.
4. Apply the Oct 21 nits — left-aligned items, "Playground" beside the logo, dim section headings (gray-500 in dark / gray-400 in light), blue-300 logo on dark.
5. Wire active-state styling using `usePathname()` from `@/i18n/navigation` (so locale-prefix is stripped automatically).

```tsx
'use client';

import clsx from 'clsx';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Logo } from '@/assets/logo';
import { sections } from '@/lib/nav';
import { ThemeToggle } from './theme-toggle';
import { LinkStatus } from './link-status';
import { LocaleSwitcher } from './locale-switcher';

export function PlaygroundSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations('Layout');
  const close = () => setIsOpen(false);

  return (
    <div className="fixed top-0 z-10 flex w-full flex-col border-b bg-sidebar border-sidebar-border lg:bottom-0 lg:z-auto lg:w-72 lg:border-r lg:border-b-0">
      <div className="flex h-14 items-center gap-2 px-4">
        <Logo className="w-6 h-6 text-blue-700 dark:text-blue-300" />
        <h3 className="text-base font-semibold text-sidebar-foreground">
          Playground
        </h3>

        <div className="ml-auto flex items-center gap-1.5">
          <LocaleSwitcher />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div
        className={clsx('overflow-y-auto lg:static lg:block', {
          'fixed inset-x-0 top-14 bottom-0 mt-px bg-sidebar': isOpen,
          hidden: !isOpen,
        })}
      >
        <ScrollArea className="h-full">
          <nav className="space-y-6 px-2 pt-5 pb-24">
            {sections.map((section) => (
              <div key={section.title}>
                <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {section.title}
                </div>
                <div className="space-y-px">
                  {section.items.length === 0 ? (
                    <div className="px-3 text-xs text-muted-foreground/60 italic">
                      coming soon
                    </div>
                  ) : (
                    section.items.map((item) => {
                      const active = pathname === item.slug;
                      return (
                        <Link
                          key={item.slug}
                          href={item.slug}
                          onClick={close}
                          className={clsx(
                            'block px-3 py-1.5 text-sm rounded-md transition-colors',
                            active
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                              : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
                          )}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            {item.title}
                            <LinkStatus />
                          </span>
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

```bash
pnpm --filter playground tsc --noEmit
```
Expected: error pointing to `./locale-switcher` (created in next task). All other errors should be resolved.

- [ ] **Step 4: Commit**

```bash
git add playground/src/lib/nav.ts playground/src/components/playground/sidebar.tsx
git commit -m "refactor(playground): restructure sidebar nav and apply design nits"
```

---

### Task C2: shadcn `dropdown-menu` primitive

**Files:**
- Create: `playground/src/components/ui/dropdown-menu.tsx`
- Modify: `playground/components.json` (already exists)

- [ ] **Step 1: Generate via shadcn CLI**

```bash
pnpm --filter playground dlx shadcn@latest add dropdown-menu
```

If interactive prompts appear, accept defaults.

- [ ] **Step 2: Verify file appeared and types resolve**

```bash
pnpm --filter playground tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add playground/src/components/ui/dropdown-menu.tsx playground/components.json
git commit -m "feat(playground): add shadcn dropdown-menu primitive"
```

---

### Task C3: `LocaleSwitcher`

**Files:**
- Create: `playground/src/components/playground/locale-switcher.tsx`

- [ ] **Step 1: Write component**

```tsx
'use client';

import { useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { useTransition } from 'react';
import { Globe } from 'lucide-react';
import { routing } from '@/i18n/routing';
import { usePathname, useRouter } from '@/i18n/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const labels: Record<string, string> = { en: 'English', de: 'Deutsch' };

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  function onSelect(next: string) {
    if (next === locale) return;
    startTransition(() => {
      // @ts-expect-error: params type is generic
      router.replace({ pathname, params }, { locale: next });
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <Globe className="h-4 w-4" />
          <span className="text-xs uppercase">{locale}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onSelect={() => onSelect(loc)}
            className={loc === locale ? 'font-semibold' : undefined}
          >
            {labels[loc] ?? loc}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

- [ ] **Step 2: Typecheck + Commit**

```bash
pnpm --filter playground tsc --noEmit
git add playground/src/components/playground/locale-switcher.tsx
git commit -m "feat(playground): add locale switcher"
```

---

### Task C4: shadcn `badge` primitive

**Files:**
- Create: `playground/src/components/ui/badge.tsx`

- [ ] **Step 1: Add via CLI**

```bash
pnpm --filter playground dlx shadcn@latest add badge
```

- [ ] **Step 2: Commit**

```bash
git add playground/src/components/ui/badge.tsx playground/components.json
git commit -m "feat(playground): add shadcn badge primitive"
```

---

### Task C5: `TwoColumn` MDX layout component

**Files:**
- Create: `playground/src/components/playground/two-column.tsx`

- [ ] **Step 1: Write component**

```tsx
import type { ReactNode } from 'react';
import { Children, isValidElement } from 'react';

/**
 * Splits MDX children into prose (left) and the first <pre>/code element (right).
 * Anything after the first code block lands back in the prose column.
 */
export function TwoColumn({ children }: { children: ReactNode }) {
  const prose: ReactNode[] = [];
  const code: ReactNode[] = [];

  Children.forEach(children, (child) => {
    if (isCodeBlock(child) && code.length === 0) {
      code.push(child);
    } else {
      prose.push(child);
    }
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-8">
      <div className="prose prose-sm dark:prose-invert max-w-none">
        {prose}
      </div>
      <div>{code}</div>
    </div>
  );
}

function isCodeBlock(node: unknown): boolean {
  if (!isValidElement(node)) return false;
  const t = node.type;
  // The Code Hike RSC <Code> shows up as a function component reference.
  if (typeof t === 'function' && (t as { name?: string }).name === 'Code') {
    return true;
  }
  // Default Markdown rendering may produce <pre>.
  return t === 'pre';
}
```

- [ ] **Step 2: Typecheck + Commit**

```bash
pnpm --filter playground tsc --noEmit
git add playground/src/components/playground/two-column.tsx
git commit -m "feat(playground): add TwoColumn MDX layout"
```

---

### Task C6: `DemoCard` component

**Files:**
- Create: `playground/src/components/playground/demo-card.tsx`

- [ ] **Step 1: Write component**

```tsx
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';

export function DemoCard({
  label = 'Live demo',
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10 rounded-lg border border-border bg-card p-6">
      <Badge variant="secondary" className="mb-3 uppercase tracking-wide">
        {label}
      </Badge>
      <div>{children}</div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add playground/src/components/playground/demo-card.tsx
git commit -m "feat(playground): add DemoCard wrapper"
```

---

### Task C7: Update `GitHubLink`

**Files:**
- Modify: `playground/src/components/playground/github-link.tsx`

- [ ] **Step 1: Confirm/normalize**

Open the file. It should accept a `path` prop (relative to repo root) and link to `https://github.com/amannn/next-intl/tree/main/<path>`. Ensure it renders a Lucide `Github` icon and reads label "View on GitHub". If the existing implementation differs, replace with:

```tsx
import { Github, ArrowUpRight } from 'lucide-react';

export function GitHubLink({ path }: { path: string }) {
  return (
    <a
      href={`https://github.com/amannn/next-intl/tree/main/${path}`}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Github className="h-4 w-4" />
      View on GitHub
      <ArrowUpRight className="h-3.5 w-3.5" />
    </a>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add playground/src/components/playground/github-link.tsx
git commit -m "refactor(playground): tighten GitHubLink markup"
```

---

### Task C8: Update `Byline`

**Files:**
- Modify: `playground/src/components/playground/byline.tsx`

- [ ] **Step 1: Localize**

Open the file. Replace any hard-coded copy with `useTranslations('Layout')` reads where appropriate. Keep the export named (per Task A6 step 3).

- [ ] **Step 2: Typecheck + Commit**

```bash
pnpm --filter playground tsc --noEmit
git add playground/src/components/playground/byline.tsx
git commit -m "refactor(playground): localize byline strings"
```

---

### Task C9: Phase C verification

- [ ] **Step 1: Lint, typecheck, build**

```bash
pnpm --filter playground lint && \
pnpm --filter playground tsc --noEmit && \
pnpm --filter playground build
```
Expected: all pass.

- [ ] **Step 2: Dev server**

```bash
pnpm --filter playground dev
```
Verify in the browser:
- `http://localhost:3000/en` renders the landing page with the polished sidebar
- Locale switcher swaps to `/de` and German strings appear in the sidebar
- Theme toggle still works
- The two existing detail pages still render (still using their old hardcoded TSX content; replaced in Phase D)

---

## Phase D — Detail pages (MDX content + live demos)

### Task D1: Server Components — `content.mdx`

**Files:**
- Create: `playground/src/app/[locale]/translations/server-components/content.mdx`

- [ ] **Step 1: Write content**

```mdx
import { TwoColumn } from '@/components/playground/two-column';

# Server Components

<TwoColumn>

- Mark a Server Component as cacheable simply by not using any client APIs.
- Read translated strings with `useTranslations()` directly inside async server components — messages stay on the server, so no client JavaScript is shipped.
- Pair with [`getTranslations()`](https://next-intl.dev/docs/environments/server-client-components#async-components) when you need it inside helpers that aren't components.

```tsx app/page.tsx
import {useTranslations} from 'next-intl';

export default function Page() {
  // !mark
  const t = useTranslations('ServerDemo');
  return <h1>{t('greeting')}</h1>;
}
```

</TwoColumn>
```

- [ ] **Step 2: Commit**

```bash
git add playground/src/app/[locale]/translations/server-components/content.mdx
git commit -m "feat(playground): add MDX content for Server Components page"
```

---

### Task D2: Server Components — `server-example.tsx`

**Files:**
- Modify: `playground/src/app/[locale]/translations/server-components/server-example.tsx`

- [ ] **Step 1: Replace body**

```tsx
import { useTranslations } from 'next-intl';

export function ServerExample() {
  const t = useTranslations('ServerDemo');
  return (
    <p className="text-2xl font-semibold text-foreground">{t('greeting')}</p>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add playground/src/app/[locale]/translations/server-components/server-example.tsx
git commit -m "feat(playground): rewrite Server Components live demo"
```

---

### Task D3: Server Components — `page.tsx` shell

**Files:**
- Modify: `playground/src/app/[locale]/translations/server-components/page.tsx`

- [ ] **Step 1: Replace body**

```tsx
import { setRequestLocale } from 'next-intl/server';
import { Badge } from '@/components/ui/badge';
import { DemoCard } from '@/components/playground/demo-card';
import { GitHubLink } from '@/components/playground/github-link';
import Content from './content.mdx';
import { ServerExample } from './server-example';

export const metadata = {
  title: 'Server Components — next-intl Playground',
  description: 'Use translations inside async Server Components.',
};

export default async function ServerComponentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <article className="px-6 lg:px-0">
      <Badge variant="outline" className="mb-3 uppercase tracking-wide">
        Demo
      </Badge>
      <Content />
      <DemoCard>
        <ServerExample />
      </DemoCard>
      <footer className="mt-8 flex justify-end">
        <GitHubLink path="playground/src/app/[locale]/translations/server-components" />
      </footer>
    </article>
  );
}
```

- [ ] **Step 2: Build**

```bash
pnpm --filter playground build
```
Expected: PASS. The MDX file is compiled by `@next/mdx`; the fenced code block is processed by Code Hike and rendered through `<Code>`.

- [ ] **Step 3: Visual smoke**

```bash
pnpm --filter playground dev
```
Open `http://localhost:3000/en/translations/server-components`. Confirm:
- Title `Server Components` from MDX
- Two-column layout with bullets left, code block right
- Code has filename header `app/page.tsx` and the `useTranslations` line is highlighted (mark)
- Live demo card shows `Hello, world!` (`Hallo, Welt!` in `/de/...`)
- GitHub link in footer points at the right path

- [ ] **Step 4: Commit**

```bash
git add playground/src/app/[locale]/translations/server-components/page.tsx
git commit -m "feat(playground): wire Server Components page shell"
```

---

### Task D4: Server Components — refresh `README.md`

**Files:**
- Modify: `playground/src/app/[locale]/translations/server-components/README.md`

- [ ] **Step 1: Trim to a short summary**

```md
# Server Components

Demonstrates reading translated strings inside async Server Components with `useTranslations()`.

See the live demo at `/[locale]/translations/server-components` and the rich content in [`content.mdx`](./content.mdx).
```

- [ ] **Step 2: Commit**

```bash
git add playground/src/app/[locale]/translations/server-components/README.md
git commit -m "docs(playground): slim Server Components README to a pointer"
```

---

### Task D5: Client Components — `content.mdx`

**Files:**
- Create: `playground/src/app/[locale]/translations/client-components/content.mdx`

- [ ] **Step 1: Write content**

```mdx
import { TwoColumn } from '@/components/playground/two-column';

# Client Components

<TwoColumn>

- Use `useTranslations()` inside [Client Components](https://next-intl.dev/docs/environments/server-client-components) for any UI that reacts to user input.
- Messages for client-side namespaces are sent to the browser — only the keys you actually call.
- ICU placeholders (`{name}`) interpolate at render time and stay locale-aware.

```tsx app/greet.tsx
'use client';
import {useState} from 'react';
import {useTranslations} from 'next-intl';

export function Greet() {
  const t = useTranslations('ClientDemo');
  const [name, setName] = useState('Frodo');
  return (
    <>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      // !mark
      <p>{t('greeting', {name})}</p>
    </>
  );
}
```

</TwoColumn>
```

- [ ] **Step 2: Commit**

```bash
git add playground/src/app/[locale]/translations/client-components/content.mdx
git commit -m "feat(playground): add MDX content for Client Components page"
```

---

### Task D6: Client Components — `client-example.tsx`

**Files:**
- Modify: `playground/src/app/[locale]/translations/client-components/client-example.tsx`

- [ ] **Step 1: Replace body**

```tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function ClientExample() {
  const t = useTranslations('ClientDemo');
  const [name, setName] = useState('');

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-muted-foreground">
        {t('label')}
      </label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('placeholder')}
        className="w-full max-w-xs rounded-md border border-border bg-background px-3 py-2 text-sm"
      />
      <p className="text-2xl font-semibold text-foreground">
        {t('greeting', { name: name || t('placeholder') })}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add playground/src/app/[locale]/translations/client-components/client-example.tsx
git commit -m "feat(playground): rewrite Client Components live demo"
```

---

### Task D7: Client Components — `page.tsx` shell

**Files:**
- Modify: `playground/src/app/[locale]/translations/client-components/page.tsx`

- [ ] **Step 1: Replace body**

```tsx
import { setRequestLocale } from 'next-intl/server';
import { Badge } from '@/components/ui/badge';
import { DemoCard } from '@/components/playground/demo-card';
import { GitHubLink } from '@/components/playground/github-link';
import Content from './content.mdx';
import { ClientExample } from './client-example';

export const metadata = {
  title: 'Client Components — next-intl Playground',
  description: 'Use translations inside Client Components.',
};

export default async function ClientComponentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <article className="px-6 lg:px-0">
      <Badge variant="outline" className="mb-3 uppercase tracking-wide">
        Demo
      </Badge>
      <Content />
      <DemoCard>
        <ClientExample />
      </DemoCard>
      <footer className="mt-8 flex justify-end">
        <GitHubLink path="playground/src/app/[locale]/translations/client-components" />
      </footer>
    </article>
  );
}
```

- [ ] **Step 2: Build + visual**

```bash
pnpm --filter playground build && pnpm --filter playground dev
```
Open `http://localhost:3000/en/translations/client-components`, type a name into the input, and confirm the greeting updates and the German locale flips it.

- [ ] **Step 3: Commit**

```bash
git add playground/src/app/[locale]/translations/client-components/page.tsx
git commit -m "feat(playground): wire Client Components page shell"
```

---

### Task D8: Client Components — refresh `README.md`

**Files:**
- Modify: `playground/src/app/[locale]/translations/client-components/README.md`

- [ ] **Step 1: Replace**

```md
# Client Components

Demonstrates reading translated strings inside Client Components with `useTranslations()` and ICU interpolation.

See the live demo at `/[locale]/translations/client-components` and the rich content in [`content.mdx`](./content.mdx).
```

- [ ] **Step 2: Commit**

```bash
git add playground/src/app/[locale]/translations/client-components/README.md
git commit -m "docs(playground): slim Client Components README to a pointer"
```

---

### Task D9: Localize landing page

**Files:**
- Modify: `playground/src/app/[locale]/page.tsx`

- [ ] **Step 1: Open the existing landing page**

Replace the existing hardcoded copy with `useTranslations('Layout')` for `title` + `tagline`. Iterate over `sections` from `@/lib/nav`, hiding `items.length === 0` sections (so empty future categories don't show as cards).

```tsx
import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { sections } from '@/lib/nav';
import { LinkStatus } from '@/components/playground/link-status';
import { PlaygroundBoundary } from '@/components/playground/boundary';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Home />;
}

function Home() {
  const t = useTranslations('Layout');
  return (
    <div>
      <div className="mb-12 text-center pt-10 px-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
          {t('title')}
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg md:text-xl">
          {t('tagline')}
        </p>
      </div>
      <PlaygroundBoundary
        label="Examples"
        className="flex flex-col gap-8 sm:gap-9"
      >
        {sections
          .filter((s) => s.items.length > 0)
          .map((section) => (
            <div key={section.title} className="flex flex-col gap-2 sm:gap-3">
              <div className="font-mono text-[10px] sm:text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                {section.title}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
                {section.items.map((item) => (
                  <Link
                    href={item.slug}
                    key={item.title}
                    className="group flex flex-col gap-1 rounded-lg bg-card px-4 sm:px-5 py-3 hover:bg-popover transition-colors"
                  >
                    <div className="flex items-center justify-between font-medium text-foreground group-hover:text-primary">
                      {item.title} <LinkStatus />
                    </div>
                    {item.description && (
                      <div className="line-clamp-3 text-sm sm:text-[13px] text-muted-foreground group-hover:text-foreground">
                        {item.description}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
      </PlaygroundBoundary>
    </div>
  );
}
```

- [ ] **Step 2: Build + Commit**

```bash
pnpm --filter playground build
git add playground/src/app/[locale]/page.tsx
git commit -m "feat(playground): localize landing page and hide empty categories"
```

---

## Phase E — Polish, tests, docs

### Task E1: Add Playwright smoke tests

**Files:**
- Create: `playground/playwright.config.ts`
- Create: `playground/tests/playground.spec.ts`
- Modify: `playground/package.json` (add `e2e` script)

- [ ] **Step 1: Config**

```ts
// playground/playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://localhost:3000' },
  webServer: {
    command: 'pnpm dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

- [ ] **Step 2: Smoke spec**

```ts
// playground/tests/playground.spec.ts
import { test, expect } from '@playwright/test';

test('landing renders in en and de', async ({ page }) => {
  await page.goto('/en');
  await expect(page.getByRole('heading', { name: /Playground/i })).toBeVisible();

  await page.goto('/de');
  await expect(page.getByRole('heading', { name: /Playground/i })).toBeVisible();
});

test('Server Components page shows the live demo greeting', async ({ page }) => {
  await page.goto('/en/translations/server-components');
  await expect(page.getByText('Hello, world!')).toBeVisible();

  await page.goto('/de/translations/server-components');
  await expect(page.getByText('Hallo, Welt!')).toBeVisible();
});

test('Client Components page renders demo and reacts to input', async ({ page }) => {
  await page.goto('/en/translations/client-components');
  const input = page.getByPlaceholder('Frodo');
  await input.fill('Sam');
  await expect(page.getByText('Hello, Sam!')).toBeVisible();
});
```

- [ ] **Step 3: Add npm script**

In `playground/package.json` `scripts`, add:
```json
"e2e": "playwright test"
```

- [ ] **Step 4: Install browsers + run**

```bash
pnpm --filter playground exec playwright install chromium
pnpm --filter playground build
pnpm --filter playground exec playwright test
```
Expected: all three tests pass.

- [ ] **Step 5: Commit**

```bash
git add playground/playwright.config.ts playground/tests playground/package.json
git commit -m "test(playground): add smoke tests for landing and detail pages"
```

---

### Task E2: Update root `playground/README.md`

**Files:**
- Modify: `playground/README.md`

- [ ] **Step 1: Rewrite**

```md
# next-intl Playground

A demo site that documents `next-intl` patterns. Built on Next.js 15, locale-prefixed routes (`/[locale]/...`), and Code Hike for code samples.

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
```

- [ ] **Step 2: Commit**

```bash
git add playground/README.md
git commit -m "docs(playground): document setup and contribution flow"
```

---

### Task E3: Add `playground/` to monorepo lint matrix

**Files:**
- Verify: `pnpm-workspace.yaml` includes `playground` (Task A1 step 1 should already cover this; just confirm)
- Verify: `turbo.json` runs lint/typecheck for the `playground` package

- [ ] **Step 1: Confirm `pnpm-workspace.yaml`**

Open it. If `playground` is not present, add it to the `packages:` array.

- [ ] **Step 2: Confirm `turbo.json` does not exclude `playground`**

Open it; `playground` should pick up the existing `lint`, `build`, `test` pipeline tasks. No changes if its `package.json` already declares `lint`, `build`, `test` scripts.

- [ ] **Step 3: Run repo-wide checks**

```bash
pnpm lint
pnpm build
```
Expected: PASS. If `pnpm test` runs the new e2e suite under turbo, ensure it isn't required for default CI yet (e2e is optional for v1 review). If turbo wants to run it, mark it as `cache: false` and remove from default pipeline:

In `turbo.json`, ensure `e2e` is its own task or excluded from `test`. Adjust as needed.

- [ ] **Step 4: Commit if any changes**

```bash
git add turbo.json pnpm-workspace.yaml
git commit -m "chore: ensure playground participates in monorepo tasks"
```

---

### Task E4: Final manual walkthrough

- [ ] **Step 1: Dev server**

```bash
pnpm --filter playground dev
```

- [ ] **Step 2: Walkthrough checklist**

For both `/en` and `/de`, in both light and dark themes:
- Landing renders, sidebar shows Translations with both items and dimmed empty future categories
- Sidebar logo uses blue-300 in dark, blue-700 in light
- "Playground" left-aligned next to the logo
- Click "Server components" — page renders with two-column layout, code block has filename header, `useTranslations` line is highlighted, live demo greeting matches locale, GitHub link target works
- Click "Client components" — same checks; typing into the input updates the greeting in the active locale
- Locale switcher swaps the URL segment and re-renders all of the above
- Theme toggle still persists across navigation

- [ ] **Step 3: If issues found, fix and commit per task; else proceed**

---

### Task E5: Push and update PR description

- [ ] **Step 1: Push**

```bash
git push origin docs/refactor-playground
```

- [ ] **Step 2: Update PR #2084 description**

Use `gh pr edit 2084 --body` (or via the GitHub UI) to reflect v1 scope: "Translations category with Server / Client Components pages, MDX + Code Hike content, locale-prefixed routing." Note future categories as out-of-scope. Leave the PR open for maintainer review.

---

## Self-review

**Spec coverage:** Each spec section maps to tasks:
- Scope (Translations + 2 pages) → D1–D8
- Architecture / split `page.tsx` + `content.mdx` → D1, D3, D5, D7
- Optional README → D4, D8 (kept as short pointer files)
- Page anatomy / TwoColumn → C5, D1, D5
- Code Hike configuration → A2, A3, B9
- Annotation handlers → B1–B8
- i18n routing → A4, A5
- Demo modules → D2, D6, A4 (messages)
- Design system / Oct 21 nits → C1 (sidebar)
- E2e tests untouched → no task removes the existing example; nothing references it
- Out of scope (tabs, CodeWithNotes) → not present in plan

**Placeholder scan:** All steps include concrete code or commands. The only deferred work is intentional: empty future categories in `nav.ts`, optional README content.

**Type consistency:** `<Code>` signature `{ codeblock: RawCode }` consistent across A3 stub, B9 real impl, and `mdx-components.tsx`. Annotation handler imports use `'codehike/code'` consistently. Locale switcher uses `routing.locales` for iteration; matches `routing.ts`.
