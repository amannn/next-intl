# Extractor Race Condition Analysis

**Date**: December 3, 2025  
**Status**: Analysis of potential remaining race conditions after previous fixes

## Background

Users report that translation files (`.po`) are intermittently getting wiped out—all translations replaced with empty strings. This affects non-source locale files (pt.po, es.po, de.po) but never the source locale (en.po).

**Observed triggers:**
- Building multiple apps simultaneously with Turborepo
- Dev server crashes/restarts during file editing

## Architecture Overview

### Key Components

1. **`extractionLoader.tsx`**: Webpack/Turbopack loader that processes source files
   - Uses a **module-level singleton** `compiler` instance per process
   - Persists through HMR in dev mode

2. **`ExtractionCompiler`**: Orchestrates extraction and persistence
   - `performInitialScan()`: Loads catalogs + scans source files + saves
   - `compile()`: Processes individual files, saves in dev mode only

3. **`CatalogManager`**: Manages in-memory state and disk persistence
   - `loadCatalogsPromise`: Promise that resolves when initial catalog load completes
   - `translationsByTargetLocale`: Map of locale → Map of ID → ExtractedMessage
   - `saveLocale()`: Writes catalog to disk with timestamp-based change detection

### Build vs Dev Mode Behavior

**Development (`isDevelopment: true`):**
- File watcher subscribes to locale changes
- `compile()` calls `save()` when messages change
- Multiple saves throughout session

**Production builds (`isDevelopment: false`):**
- No file watcher
- `compile()` does NOT call `save()`
- Only ONE save occurs at end of `performInitialScan()`

## Previous Fixes Applied

The following race conditions were addressed in commits `8d81357f`, `1035c19e`, `36de8e07`:

1. **`loadCatalogsPromise` synchronization**: `saveLocale()` now awaits this promise to ensure catalogs are loaded before saving
2. **Chained promise in `onLocalesChange`**: New locale additions chain to existing promise
3. **Timestamp-based change detection**: Reload catalog if file was modified externally before saving

## Remaining Race Conditions

### 1. Cross-Process Race Condition (Turborepo/Parallel Builds) ⚠️ HIGH SEVERITY

**The Issue:**
When multiple processes build simultaneously (e.g., Turborepo building multiple apps):

```
Process A                           Process B
─────────────────────────────────  ─────────────────────────────────
1. Read de.po (has translations)   
                                    2. Read de.po (has translations)
3. Extract messages, save de.po   
   (preserves translations)        
                                    4. Extract messages, save de.po
                                       (uses stale snapshot, overwrites A's changes)
```

**Root Cause:**
- Each process has its own singleton compiler instance
- No cross-process file locking mechanism
- Last writer wins, potentially overwriting valid translations

**Evidence:**
- User reports issue "when building multiple apps at the same time (using pnpm build with Turborepo)"
- Issue happens "only the first time" ran build (when multiple processes race)

### 2. Timestamp Check Race Window ⚠️ MEDIUM SEVERITY

**Location:** `CatalogManager.saveLocale()` lines 371-376

```typescript
const lastWriteTime = this.lastWriteByLocale.get(locale);
const currentFileTime = await persister.getLastModified(locale);
if (currentFileTime && lastWriteTime && currentFileTime > lastWriteTime) {
  await this.reloadLocaleCatalog(locale);
}
// ← WINDOW: Another process could write here
await persister.write(locale, localeMessages);  // Overwrites!
```

**The Issue:**
Between checking file time and writing, another process could write, and we'd overwrite it.

### 3. First Build Edge Case (undefined `lastWriteTime`) ⚠️ MEDIUM SEVERITY

**Location:** `CatalogManager.saveLocale()` lines 371-376

**The Issue:**
When `lastWriteTime` is undefined (first time writing to a locale):
```typescript
if (currentFileTime && lastWriteTime && currentFileTime > lastWriteTime)
//                     ^^^^^^^^^^^^^^ undefined on first write
```
The condition is `false`, so we skip the reload check. If another process wrote translations before our first write, we overwrite them.

### 4. Silent Read Failures Cause Wipe ⚠️ HIGH SEVERITY

**Location:** `CatalogManager.loadLocaleMessages()` lines 175-187

```typescript
private async loadLocaleMessages(locale: Locale): Promise<Array<ExtractedMessage>> {
  try {
    const messages = await persister.read(locale);
    // ...
    return messages;
  } catch {
    return [];  // ← Silent failure returns empty array!
  }
}
```

**The Issue:**
If reading a catalog fails for any reason:
- File corruption during concurrent write
- Encoding issues
- Temporary I/O error

We silently return `[]`, which then propagates to `saveLocale()`:
```typescript
const prevMessages = this.translationsByTargetLocale.get(locale);  // Empty Map
const localeMessages = messages.map((message) => {
  const prev = prevMessages?.get(message.id);
  return {
    // ...
    message: isSourceLocale ? message.message : (prev?.message ?? '')  // All empty!
  };
});
```

**All translations become empty strings!**

### 5. Silent Write Failures ⚠️ LOW SEVERITY

**Location:** `CatalogPersister.write()` lines 25-38

```typescript
async write(locale: Locale, messages: Array<ExtractedMessage>): Promise<void> {
  try {
    // ...
    await fs.writeFile(filePath, content);
  } catch (error) {
    console.error(`❌ Failed to write catalog: ${error}`);
    // No throw! Continues as if successful
  }
}
```

After this, `saveLocale()` updates timestamp tracking based on a potentially failed write:
```typescript
await persister.write(locale, localeMessages);
const newTime = await persister.getLastModified(locale);  // Gets old timestamp
this.lastWriteByLocale.set(locale, newTime);  // Corrupt state
```

## Analysis of User-Reported Scenarios

### Scenario: Turborepo Parallel Builds
**Most likely cause:** Cross-process race condition (#1)

Multiple apps building simultaneously, each with its own compiler instance, racing to read and write the same catalog files. No coordination between processes.

### Scenario: Dev Server Crashes During File Editing  
**Most likely cause:** Silent read failures (#4)

When editing files with Poedit during dev server operation:
1. Poedit writes partial file
2. Dev server's file watcher triggers
3. `reloadLocaleCatalog()` reads corrupted/partial file → fails → returns `[]`
4. Next save writes empty translations

## Recommended Fixes

### Fix 1: File Locking for Cross-Process Safety

Use a file locking mechanism (e.g., `proper-lockfile` or similar):

```typescript
import lockfile from 'proper-lockfile';

private async saveLocale(locale: Locale): Promise<void> {
  const filePath = persister.getFilePath(locale);
  const release = await lockfile.lock(filePath, { retries: 5 });
  try {
    // Reload after acquiring lock (file may have changed)
    await this.reloadLocaleCatalog(locale);
    // ... perform save
  } finally {
    await release();
  }
}
```

### Fix 2: Don't Swallow Read Errors Silently

```typescript
private async loadLocaleMessages(locale: Locale): Promise<Array<ExtractedMessage>> {
  const persister = await this.getPersister();
  try {
    const messages = await persister.read(locale);
    const fileTime = await persister.getLastModified(locale);
    this.lastWriteByLocale.set(locale, fileTime);
    return messages;
  } catch (error) {
    // Only return empty if file doesn't exist
    if (error.code === 'ENOENT') {
      return [];
    }
    // For other errors (corruption, encoding), propagate
    throw error;
  }
}
```

### Fix 3: Atomic Writes

Write to a temp file then rename (atomic on most filesystems):

```typescript
async write(locale: Locale, messages: Array<ExtractedMessage>): Promise<void> {
  const filePath = this.getFilePath(locale);
  const tempPath = filePath + '.tmp.' + process.pid;
  const content = this.formatter.serialize(messages, {locale});
  
  await fs.mkdir(path.dirname(filePath), {recursive: true});
  await fs.writeFile(tempPath, content);
  await fs.rename(tempPath, filePath);  // Atomic
}
```

### Fix 4: Handle First-Write Race

Track whether we've ever successfully read the file:

```typescript
private hasLoadedLocale: Set<Locale> = new Set();

private async saveLocale(locale: Locale): Promise<void> {
  await this.loadCatalogsPromise;
  
  const persister = await this.getPersister();
  const isSourceLocale = locale === this.config.sourceLocale;
  
  // Always reload before first save to avoid overwriting concurrent writes
  if (!this.hasLoadedLocale.has(locale)) {
    await this.reloadLocaleCatalog(locale);
    this.hasLoadedLocale.add(locale);
  }
  
  // Existing timestamp check...
  const lastWriteTime = this.lastWriteByLocale.get(locale);
  const currentFileTime = await persister.getLastModified(locale);
  if (currentFileTime && lastWriteTime && currentFileTime > lastWriteTime) {
    await this.reloadLocaleCatalog(locale);
  }
  // ...
}
```

## Test Coverage Gaps

The existing tests use in-memory filesystem mocking and single-process execution. To properly test cross-process races, we would need:

1. Integration tests that spawn multiple processes
2. Tests that simulate partial/corrupted file reads
3. Tests for first-write scenarios with concurrent processes

## Recommended Priority

1. **Fix #4 (Silent read failures)** - High impact, straightforward fix ✅ IMPLEMENTED
2. **Fix #3 (Atomic writes)** - Reduces corruption window
3. **Fix #2 (Don't swallow read errors)** - Better error handling ✅ IMPLEMENTED (same as #4)
4. **Fix #1 (File locking)** - Most complete solution but adds dependency

## Implemented Fix

The fix in `CatalogManager.loadLocaleMessages()` now only returns an empty array for `ENOENT` errors (file not found). All other errors (corruption, I/O, permission, encoding) are propagated instead of silently returning empty translations.

**Before:**
```typescript
catch {
  return [];  // ALL errors → empty array → wipe translations
}
```

**After:**
```typescript
catch (error) {
  if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
    return [];  // Only file-not-found → empty (new locale setup)
  }
  throw error;  // Other errors propagate, preventing silent wipes
}
```

This addresses the scenario where file corruption or I/O errors during concurrent access would silently return empty translations, leading to wipes.

## Appendix: Code Flow During Build

```
1. First file enters extractionLoader
   └── Creates singleton ExtractionCompiler
       └── constructor kicks off performInitialScan()
           ├── loadMessages()
           │   ├── loadSourceMessages()  // Read source catalog + extract from files
           │   └── loadTargetMessages()  // Read all target catalogs
           └── save()
               ├── saveLocale(sourceLocale)
               └── saveLocale(targetLocale) for each target

2. First file's compile() awaits initialScanPromise
   └── extractFileMessages() updates internal state
   └── (no save in production)

3. Subsequent files' compile() runs
   └── Updates internal state
   └── (no save in production)

Result: Only ONE save at end of initial scan in production builds
```

This means in production builds, any messages extracted from files AFTER the initial scan aren't saved - but this is okay because `loadMessages()` already scans all source files. The individual `compile()` calls just update state for hot paths.
