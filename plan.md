# Tree-shaking reimplementation direction

## Handoff brief (original user intent)

- Use [rfcs/003-tree-shaking.md](rfcs/003-tree-shaking.md) (including implementation notes) as the source of truth for direction.
- There is a throwaway prototype already on this branch in:
  - [packages/next-intl](packages/next-intl)
  - [examples/example-app-router-playground](examples/example-app-router-playground)
- The prototype appears to work, but it is PoC only. Replace the `next-intl` implementation with a new one that is efficient and maintainable.
- Keep the example integration roughly similar for now; apply only quick wins there.
- Revert prior PoC changes in `next-intl` and provide a fresh implementation.
- Do not address RFC open questions yet in implementation; only track them as open items.

## Scope and decisions locked

- Keep opt-in at plugin level: `experimental.treeShaking` + `experimental.srcPath`.
- Implement full RFC prototype depth now: segment-level ownership + key-level static analysis + `useExtracted` key generation parity + dynamic fallback.
- Support both dev and build paths now; deterministic build ordering stays an explicit open question.
- Keep manifest consumption/pruning logic in the example app for this iteration.
- Defer committed unit tests for now; prioritize end-to-end prototype verification in the playground.

## 1) Revert PoC implementation in `next-intl`, then rebuild cleanly

- Revert PoC-specific implementation files/edits under:
  - [packages/next-intl/src/tree-shaking](packages/next-intl/src/tree-shaking)
  - [packages/next-intl/src/watcher/SharedSourceWatcher.tsx](packages/next-intl/src/watcher/SharedSourceWatcher.tsx)
  - [packages/next-intl/src/plugin/treeShaking/initTreeShaking.tsx](packages/next-intl/src/plugin/treeShaking/initTreeShaking.tsx)
  - [packages/next-intl/src/extractor/catalog/CatalogManager.tsx](packages/next-intl/src/extractor/catalog/CatalogManager.tsx)
  - [packages/next-intl/src/plugin/createNextIntlPlugin.tsx](packages/next-intl/src/plugin/createNextIntlPlugin.tsx)
  - [packages/next-intl/src/plugin/types.tsx](packages/next-intl/src/plugin/types.tsx)
  - [packages/next-intl/package.json](packages/next-intl/package.json) and lockfile entries
- Re-introduce a fresh implementation with smaller, focused modules (analyzer, manifest writer, lifecycle/service, watcher coordination), not by patching PoC behavior in place.

## 2) Plugin wiring + manifest alias in library (not app config)

- Update [packages/next-intl/src/plugin/getNextConfig.tsx](packages/next-intl/src/plugin/getNextConfig.tsx) so `experimental.treeShaking` automatically wires `next-intl/_client-manifest.json` alias for both Turbopack and Webpack.
- Keep manifest path at `node_modules/.cache/next-intl-client-manifest.json`.
- Validate required config upfront in plugin init (`treeShaking` requires `srcPath`; reuse existing validation style).

Essential integration point:

```171:175:packages/next-intl/src/plugin/getNextConfig.tsx
const resolveAlias: Record<string, string> = {
  'next-intl/config': resolveI18nPath(pluginConfig.requestConfig)
};
```

## 3) Analyzer reimplementation aligned with RFC notes

- Build segment-level analyzer around App Router entry files and provider ownership in `layout.tsx`.
- Traverse module graph from segment entry roots, only collecting translation usage on effective client paths.
- Use `@swc/core` for parsing/AST evaluation and `dependency-tree` to observe entry module graphs (including `tsconfig` alias support).
- Implement static translation collection cases:
  - static namespace + static key
  - static namespace + dynamic key => full namespace
  - no namespace => key-level path
  - translator methods: `t`, `t.rich`, `t.markup`, `t.has`, `t.raw`
- Implement `useExtracted` parity:
  - mirror Rust key generation (SHA-512 -> base64 -> first 6)
  - support object syntax (`id`, `message`) and namespace prefixing
  - fallback conservatively when non-static

Reference algorithm:

```8:12:packages/swc-plugin-extractor/src/key_generator.rs
let hash = Sha512::digest(message.as_bytes());
let base64 = base64::engine::general_purpose::STANDARD.encode(hash);
base64[..6].to_string()
```

## 4) Efficiency + maintainability guardrails

- Keep `dependency-tree` as the graph backbone for now, but bound analysis by `experimental.srcPath` matching.
- Apply `srcPath` filtering to analyzed files consistently; allow traversing into `node_modules` only when paths are explicitly included via `srcPath` (including array values), matching extractor expectations.
- Add cache/invalidation strategy for changed files so watch updates avoid full cold rescans when possible (at least per-affected-root granularity with dependency cache reuse).
- Use shared watcher.

## 5) Dev/build lifecycle behavior

- Dev:
  - seed empty manifest immediately
  - run initial analysis
  - subscribe to watcher changes and refresh manifest incrementally
- Build:
  - run initial analysis at startup in a best-effort way that is reliable in practice
  - keep fallback-safe behavior if analysis lags briefly (no hard failure)
- Add explicit warning logs only when analysis genuinely fails.

## 6) Example quick wins (minimal)

- Keep pruning logic in [examples/example-app-router-playground/src/app/[locale]/layout.tsx](examples/example-app-router-playground/src/app/[locale]/layout.tsx) for now.
- Remove manual alias wiring from [examples/example-app-router-playground/next.config.ts](examples/example-app-router-playground/next.config.ts) once plugin aliasing is in place.
- Keep example behavior otherwise similar to current PoC.

## 7) Verification for this prototype (no committed tests yet)

- Capture baseline manifest snapshot from current PoC before reimplementation:
  - [examples/example-app-router-playground/node_modules/.cache/next-intl-client-manifest.json](examples/example-app-router-playground/node_modules/.cache/next-intl-client-manifest.json)
- After implementation, run a production build in:
  - [examples/example-app-router-playground](examples/example-app-router-playground)
- Compare resulting manifest against baseline to verify equivalent correctness for current playground behavior.
- Keep lint/prettier clean on touched files.

## 8) RFC note update

- Update [rfcs/003-tree-shaking.md](rfcs/003-tree-shaking.md) open questions to explicitly track: build-time determinism vs best-effort startup race tolerance for manifest readiness.
