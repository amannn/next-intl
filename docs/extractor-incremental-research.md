# Extractor Incremental Updates: Research & Suggestion

## Current Behavior (Loader-Based)

When **any** file in `srcPath` changes:
1. `addContextDependency(dir)` invalidates the catalog loader
2. Loader re-runs **fully**: scans all source files, extracts from each, merges, saves
3. We **do not know which file changed** – the loader API provides no trigger info

**Granularity loss**: With the old parcel watcher, we received `handleFileEvents([{path: 'src/Foo.tsx'}])` and could process only that file. Now we process all 40+ files when one changes.

## Tailwind's Approach (@tailwindcss/webpack)

Source: https://github.com/tailwindlabs/tailwindcss/blob/main/packages/%40tailwindcss-webpack/src/index.ts

### Key Techniques

1. **Module-level cache** (QuickLRU): Persists across loader invocations
   - `mtimes: Map<file, mtime>` – detect which files changed
   - `compiler`, `scanner`, `candidates` – reuse when possible

2. **addDependency for each scanned file**:
   ```ts
   for (let file of context.scanner.files) {
     this.addDependency(absolutePath)
   }
   ```
   Webpack knows exactly which files the output depends on.

3. **addContextDependency for glob base dirs**: Catches new files matching patterns.

4. **Incremental vs full rebuild**:
   - Compare `fs.statSync(file).mtimeMs` to cached `context.mtimes`
   - If any file's mtime changed → `rebuildStrategy = 'full'`
   - Full: recreate compiler, new scanner
   - Incremental: reuse compiler, run scanner.scan() and **accumulate** candidates

5. **Critical**: Tailwind's Scanner returns a **streaming iterator** (`scanner.scan()`). The Oxide scanner may do internal caching. Tailwind **accumulates** `context.candidates.add(candidate)` – they never clear, so new classes get added. For CSS this works (additive). For message extraction we need **replacements** (message removed from file A), so we can't just accumulate.

### Why Tailwind Can Be "Incremental"

- **Compiler**: Reused unless config/plugins change (mtimes check)
- **Scanner**: Reused unless full rebuild
- **Candidates**: Accumulative set – new classes add, old stay (CSS is additive)
- **Build**: `compiler.build([...context.candidates])` – uses accumulated set

For us: messages are **not additive**. If we remove `t('Foo')` from a file, we must remove it from the catalog. We need full merge semantics.

## Suggestion: Incremental Extraction via mtime Cache

### Option A: addDependency + mtime-based incremental processing

1. **addDependency for each source file** (like Tailwind)
   - After first scan, call `this.addDependency(file)` for each file
   - Requires passing loader context into ExtractionCompiler/CatalogManager
   - Doesn't reduce work – we still full-scan when any dep changes
   - Only helps webpack's internal invalidation granularity

2. **Persist mtimes + messagesByFile to disk**
   - Cache file: `.next/cache/next-intl-extractor.json` with `{ mtimes: {...}, messagesByFile: {...} }`
   - On loader run: get source files, read mtimes from fs
   - Only call `processFile` for files where `mtime !== cachedMtime`
   - For unchanged files: reuse `messagesByFile.get(file)` from cache
   - Merge: apply delta from changed files onto cached state
   - **Benefit**: Process 1 file instead of 40 when 1 changes

3. **Implementation sketch**:
   - `CatalogManager` loads cache at start
   - `loadMessages` → get source files → partition into changed/unchanged by mtime
   - Process only changed files
   - Merge results with cached messages for unchanged files
   - Save catalogs, persist cache with new mtimes

### Option B: Hybrid – keep parcel watcher for dev incremental, loader for build

- Dev: parcel watcher → granular `handleFileEvents` → process only changed files
- Build: loader → full scan (acceptable, one-time)
- Tradeoff: Two code paths, watcher overhead in dev

### Option C: Accept full scan, optimize elsewhere

- Full scan of 40 files is ~20–50ms (from logs)
- Focus on: faster extraction, parallel processing, caching extractor output
- Simpler, no cache invalidation bugs

## Logging Added

With `NEXT_INTL_EXTRACT_DEBUG=1`, the log now includes:

- **totalFilesScanned**: All files we read and ran extraction on
- **filesChanged**: Files where `haveMessagesChangedForFile` was true (actual delta)
- **granularityLoss**: When `filesScanned > filesChanged`, shows "N files reprocessed unnecessarily"

Example (one file changed):
```
[EXTRACTION] Extraction completed {"filesScanned":40,"filesChanged":1,"granularityLoss":"39 files reprocessed unnecessarily (no message delta)"}
```

## Recommendation

**Short term**: Use the new logging to measure the cost. If `filesScanned` is 40 and `filesChanged` is 1 on typical edits, the overhead is clear.

**Medium term**: Implement Option A (mtime cache) if the full-scan cost is noticeable. The cache key is: `projectRoot + srcPaths + sourceLocale`. On loader run, stat all source files, diff mtimes, process only changed. Persist cache to `.next/cache/` or similar.

**Risk**: Cache invalidation – if cache is stale (e.g. file changed externally), we might miss updates. Mitigation: checksum or mtime check before using cached messages for a file.
