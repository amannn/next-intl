# Analysis: "removes references when a message is dropped from a single file" test

## Test flow

1. Edit Greeting.tsx to add both "Hey!" and "Howdy!" (both use `useExtracted()`)
2. `page.goto('/')` → `expectCatalog` until both +YJVTi and 4xqPlJ present
3. Edit Greeting.tsx to remove "Hey!" (only "Howdy!" remains)
4. `page.goto('/')` → `expectCatalog` until +YJVTi has Footer.tsx ref but NOT Greeting.tsx

The predicate fails when `heyEntry` still contains `Greeting.tsx` in its reference list.

## Root cause (from logging)

**Local (passes):**
- `phase2 after goto`: heyHasGreeting=**false** — catalog already correct
- `expectCatalog` passes on poll #1 because the catalog was updated by the goto

**CI (fails):**
- `phase2 after goto`: heyHasGreeting=**true** — catalog still has stale refs
- `expectCatalog` never passes; predicate times out (5s default)
- Catalog content never updates; extraction appears to run with old Greeting.tsx

## Timing difference

| Step | Local | CI |
|------|-------|-----|
| phase1 after edit | heyEntry=true, howdyEntry=false | same |
| phase1 complete | ~1288ms | ~650ms |
| phase2 after edit (before goto) | heyHasGreeting=true (stale) | same |
| phase2 after goto | **heyHasGreeting=false** (correct) | **heyHasGreeting=true** (stale) |

Locally, the second `goto` triggers the catalog loader to run extraction with the updated Greeting.tsx, and the catalog is correct. In CI, the same `goto` yields a catalog that still has the old refs.

## What was tried (all failed in CI)

1. **Touch en.po** — force loader invalidation via `addContextDependency` on messagesDir
2. **Wait 500ms–5000ms** after touch before goto
3. **Content-changing touch** — write `content + '\n'` then restore
4. **Multiple touch+wait+goto cycles** (3 cycles)
5. **networkidle** before second edit
6. **page.reload()** after goto
7. **Cache-busting URL** (`/?_=timestamp`)
8. **reuseExistingServer: false** — fresh dev server in CI

None of these caused the catalog to update in CI.

## Hypothesis

The catalog loader runs when we request the page. It uses `addContextDependency` on `src/` for invalidation. When Greeting.tsx is edited, the loader should be invalidated and re-run when we `goto`.

**Likely causes:**

1. **File watcher timing** — CI file watcher may not see the edit before the request, or may process events differently.
2. **Turbopack caching** — Loader output may be cached in a way that ignores invalidation in CI.
3. **Process isolation** — Test runs in one process, dev server in another; different FS or watcher behavior in CI.

## Suggested next steps

1. Inspect `addContextDependency` on `src/` for Turbopack and whether it behaves differently in CI.
2. Add logging around the catalog loader’s invalidation and extraction runs.
3. Check if the ExtractionCompiler reads from disk or from a cached module graph.
4. Try running the test in isolation (e.g. first in the suite) to rule out prior test interference.
