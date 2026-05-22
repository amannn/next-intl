# example-expo-monorepo

Two apps + one shared UI package + one shared message catalog:

- `apps/mobile` — Expo + `expo-intl`
- `apps/web` — Next.js + `next-intl`
- `packages/ui` — shared React component library that uses `useExtracted`
- `messages/{en,de}.po` — single source of truth for every translation

The shared package imports `_useExtracted as useExtracted` from `use-intl/react`. The SWC plugin recognizes that import source, so calls inside `packages/ui` get the same compile-time rewrite as calls inside the apps themselves.

```text
examples/example-expo-monorepo/
├── messages/{en,de}.po       # everything lives here
├── scripts/extract.mjs       # workspace-wide extraction
├── apps/
│   ├── mobile/               # no messages dir of its own
│   └── web/                  # no messages dir of its own
└── packages/
    └── ui/                   # <Greeting/>, <LocaleSwitcher/>
```

## How catalogs are shared

Every translation lives in exactly one file: `messages/{en,de}.po` at the workspace root. There are no per-app or per-package catalogs.

- Each app's bundler plugin is configured with `messages.path: '../../messages'` and `srcPath: ['./src', '../<sibling>/src', '../../packages/ui/src']`. Because each app's `srcPath` is the union of every source location, both apps produce the same catalog when they extract.
- Each app's runtime imports the single workspace catalog (no merge step).
- `pnpm extract` at the root re-extracts the full set without booting either dev server.

That means there's exactly one place to translate any string — `messages/de.po` — regardless of which app renders it.

## Try it

From the next-intl repo root:

```bash
pnpm install

# One-shot: re-extract everything in the workspace
pnpm -F example-expo-monorepo extract

# Or rely on the per-app dev watchers (either works; they extract the same set)
pnpm -F mobile-app start    # expo start
pnpm -F web-app dev         # next dev
```

The same `<Greeting name="Hugo" unreadCount={3} />` from `packages/ui/src/greeting.tsx` renders translated copy in both apps, driven by the workspace-level catalog.

## ICU features and React Native

The demo deliberately uses only placeholders (`{name}`) and rich-text tags (`<strong>...</strong>`) because they require no `Intl.*` runtime support. If you want to use plural / select / number / date formatting (`{count, plural, ...}`, `{value, number}`, etc.) in your own components, the bundled Hermes engine may need polyfills depending on the platform and SDK version. Install the relevant `@formatjs/intl-*` packages (`intl-pluralrules`, `intl-numberformat`, `intl-datetimeformat`, ...) and import them at the top of your Expo entry file before any component calls `useExtracted`.
