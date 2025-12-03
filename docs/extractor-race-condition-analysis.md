# Extractor Race Condition Analysis

**Date**: December 3, 2025  
**Status**: Analysis of potential remaining race conditions after previous fixes

## Background

Users report that translation files (`.po`) are intermittently getting wiped out—all translations replaced with empty strings. This affects non-source locale files (pt.po, es.po, de.po) but never the source locale (en.po).

**Observed triggers:**
- Dev server running while rapidly editing source files (e.g., AI coding agents)
- Dev server crashes/restarts during file editing with external tools (Poedit)

**Frequency:** Rare after v4.5.6 fixes (~1 in 50+ builds), but still occurs.

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

### 1. Cross-Process Race Condition (Turborepo/Parallel Builds) ⚠️ LOW SEVERITY

**Note:** This was initially suspected but is **unlikely to be the cause**. In the reported cases, only a single app uses next-intl extraction, so there's only one process writing to catalog files. Other apps in the Turborepo don't touch translation files.

This would only be relevant if multiple apps share the same translation files AND use extraction simultaneously.

### 2. Timestamp Check Race Window ⚠️ LOW SEVERITY

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

### Scenario: Rapid Source File Edits (AI Coding Agents)
**Most likely cause:** Silent read failures (#4) combined with transient I/O errors

Colin reported: "GitHub Copilot agent on VSCode did a bunch of changes (e.g., changed 10-15 files in a short interval of time) while the dev server was running. After it finished its changes, both pt.po and es.po were wiped out."

Key observation: **Both locales wiped simultaneously, but on retry pt.po saved correctly while es.po wiped again.**

This matches the behavior of silent read failures:
1. Copilot rapidly edits 10-15 source files
2. Dev server compiles each change → multiple `save()` calls (fire-and-forget, debounced)
3. Target locales saved in parallel: `Promise.all(targetLocales.map(saveLocale))`
4. If reading `es.po` fails (transient I/O, VS Code background indexing) → returns `[]` → wipe
5. Reading `pt.po` succeeds → saved correctly

VS Code performs background operations (indexing, git status) that can cause brief file access conflicts, especially during rapid changes.

### Scenario: Dev Server Crashes During File Editing (Poedit)
**Most likely cause:** Silent read failures (#4)

When editing files with Poedit during dev server operation:
1. Poedit writes partial file
2. Dev server's file watcher triggers
3. `reloadLocaleCatalog()` reads corrupted/partial file → fails → returns `[]`
4. Next save writes empty translations

### Why Issue Reduced After v4.5.6

The `loadCatalogsPromise` synchronization fixes closed most timing windows. The remaining ~1 in 50+ occurrence rate suggests transient errors (brief I/O conflicts) rather than systematic race conditions.

## Recommended Fixes

### Fix 1: Don't Swallow Read Errors Silently ✅ IMPLEMENTED

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

**Impact:** Transforms silent data loss into loud build failure. User can retry instead of losing translations.

### Fix 2: Atomic Writes (Future consideration)

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

### Fix 3: File Locking (Future consideration, if needed)

Only needed if cross-process issues are confirmed. Adds complexity and a dependency.

## Test Coverage

Added tests for the implemented fix:
1. `propagates read errors instead of silently returning empty` - verifies file system errors (EACCES, etc.) throw
2. `returns empty array only for ENOENT errors` - verifies new locale setup still works
3. `propagates parser errors from corrupted/truncated files` - verifies truncated content (from concurrent write) causes parser to throw rather than silently wiping

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

**Why this helps:**

When rapid file changes occur and a transient read error happens (VS Code indexing, brief I/O conflict):
- **Before:** `es.po` read fails → returns `[]` → `es.po` saved with empty translations → **silent wipe**
- **After:** `es.po` read fails → throws error → build fails → user sees error, can retry → **no data loss**

This transforms a rare, hard-to-debug data loss into a visible error that prompts a retry.

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
