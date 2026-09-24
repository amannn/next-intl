# Type-performance tests

This directory contains TypeScript type-performance tests for `use-intl`. They measure how many times the TypeScript
compiler instantiates generic types (`Instantiations` in `tsc --extendedDiagnostics`) and detect regressions
automatically in CI.

## Why `Instantiations`, not `Total time`

`Total time` varies with CPU load, caching, and machine temperature. `Instantiations` is a pure, deterministic count:
the same source always produces the same number regardless of where or when it runs. A 20 % increase in instantiations
reliably signals that a type change added real complexity.

## Running locally

```sh
# Measure instantiation count for the full test suite
pnpm perf:types

# Compare current branch against upstream/main and fail if regression > 5%
pnpm perf:types:ci

# Override the comparison base or threshold
node perf/check-type-perf.mjs --base-ref origin/my-base-branch --threshold 1.15
```

`perf:types:ci` auto-detects the comparison base: it prefers `upstream/main` (fork workflow) and falls back to
`origin/main`. In GitHub Actions, `GITHUB_BASE_REF` is used automatically.

## How the CI check works

`check-type-perf.mjs` temporarily swaps the files listed in `TRACKED_FILES` with their versions from the base branch,
runs `tsc --extendedDiagnostics`, then restores the originals and runs again. The ratio of PR / baseline instantiations
is compared against `THRESHOLD` (default: 1.05 = 5%).

Files are restored in a `try/finally` block, so an interrupted run cannot leave the working tree dirty.

## File structure

```
perf/
├── helpers.ts                   # Shared type primitives (import from here, not inline)
├── check-type-perf.mjs          # CI comparison script
├── MessageKeys.perf-test.ts     # NestedKeyOf / MessageKeys / NamespaceKeys
├── createTranslator.perf-test.ts# Translator<T, Namespace> + ICUArgs via call sites
├── ICUArgs.perf-test.ts         # ICUArgs<Message, Options> in isolation
└── ICUTags.perf-test.ts         # ICUTags<MessageString, TagsFn> in isolation
```

Each test file name mirrors its primary source file (`<source>.perf-test.ts`).

## Writing a new test

### 1. Create `perf/<SourceFile>.perf-test.ts`

Import shared primitives from `helpers.ts`:

```ts
import type {Assert, Digit, ICUArgOpts, TwoDigit} from './helpers.js';
```

| Helper         | Size | Use for                                                          |
|----------------|------|------------------------------------------------------------------|
| `Digit`        | 10   | Translator tests — key count scales aggressively with call sites |
| `TwoDigit`     | 100  | Bulk mapped types — 100 independent instantiations per variant   |
| `ICUArgOpts`   | —    | Any test that touches `ICUArgs` directly                         |
| `Assert<T, E>` | —    | Spot-check that `T extends E`; resolves to `never` on regression |

### 2. Apply the two-layer pattern

Every test file should have two sections:

**Spot checks** — one representative message per structural variant, each wrapped in `Assert`. These double as
type-level regression tests:

```ts
type AssertPlain = Assert<ICUArgs<'Hello, {name}!', ICUArgOpts>, {name: string}>;
```

**Bulk instantiation** — 100 unique messages generated via `TwoDigit` mapped types. Unique param/tag names per index `K`
prevent structural caching:

```ts
type BulkPlain = { [K in TwoDigit]: ICUArgs<`Hello, {name${K}}!`, ICUArgOpts> };
```

### 3. Force evaluation

TypeScript evaluates type aliases lazily. Reference every type you want counted in a terminal tuple so the compiler
cannot defer work:

```ts
type _ = [AssertPlain, BulkPlain, ...]
extends
unknown ? true : false;
```

### 4. Register the source file in the CI check

Open `check-type-perf.mjs` and add the source file path (relative to repo root) to `TRACKED_FILES`:

```js
const TRACKED_FILES = [
  'packages/use-intl/src/core/MessageKeys.tsx',
  'packages/use-intl/src/core/YourNewFile.tsx', // ← add here
  ...
];
```

The script swaps these files to their base-branch versions for the baseline measurement. Only add files whose types are
directly exercised by the perf tests — unrelated files add noise to the comparison.

## Maintaining the tests

- **TypeScript version upgrades** may change instantiation counts. Run `pnpm perf:types:ci` and, if the change is
  expected, adjust `THRESHOLD` in `check-type-perf.mjs` or accept the new baseline by doing nothing (the next main merge
  becomes the new baseline automatically).
- **Intentional complexity increases** — if a type change is correct but expensive, document why in the PR description
  and, if needed, raise `THRESHOLD` temporarily with a follow-up issue to optimise.
- **Adding ICU variants** — extend the spot-check list and add a corresponding `Bulk*` mapped type. Keep the `TwoDigit`
  size unless you have a good reason to change it.
