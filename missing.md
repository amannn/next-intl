# Tests dropped during ExtractionCompiler E2E migration

Tests that could not be migrated to e2e or proved unreliable.

## JSON format

- creates the messages directory and source catalog when they do not exist initially
  - reason: App requires messages to exist for getRequestConfig to load; chicken-and-egg
  - verdict: ok, leave as unit test
 initializes all messages to empty string when adding new catalog
  - reason: Catalog add watcher
  - verdict: is this the same as "writes to newly added catalog file"? if so, drop.
- restores previous translations when messages are added back
  - reason: Predicate timing – app has Footer with Hey! so state differs from unit test
  - verdict: this is important, add the e2e test
- preserves manual translations in target catalogs when adding new messages
  - reason: Multi-step flow; de.json state across edits unreliable
  - verdict: it should be reliable. make sure we're running sequentially.
- avoids race condition when compiling while a new locale is added
  - reason: Race condition – requires readFile interceptors
  - verdict: lets leave as unit test
- avoids race condition when watcher processes files during initial scan
  - reason: Race condition – requires readFile interceptors
  - verdict: lets leave as unit test
- ignores parse error from watcher and waits for next file update
  - reason: Parse error may leave extraction in bad state; recovery timing unreliable
  - verdict: lets leave as unit test

## PO format

- tracks all line numbers when same message appears multiple times in one file
  - reason: Needs multi-file setup; migrate when PO suite is expanded
  - verdict: add the e2e test
- saves changes to descriptions
  - reason: Pending PO migration
  - verdict: add the e2e test
- combines references from multiple files
  - reason: Pending PO migration
  - verdict: add the e2e test
- merges descriptions when message appears in multiple files
  - reason: Pending PO migration
  - verdict: add the e2e test
- updates references in all catalogs when message is reused
  - reason: Pending PO migration
  - verdict: add the e2e test
- removes references when a message is dropped from a single file
  - reason: Pending PO migration
  - verdict: add the e2e test
- removes obsolete messages during build
  - reason: Uses isDevelopment: false – build mode
  - verdict: leave as unit test
- removes messages when a file is deleted during dev
  - reason: File delete watcher
  - verdict: add the e2e test
- removes obsolete references after file rename (3 variants)
  - reason: File rename watcher
  - verdict: keep as unit test
- supports namespaces
  - reason: Pending PO migration
  - verdict: add the e2e test
- retains metadata when saving back to file
  - reason: PO metadata handling
  - verdict: add the e2e test
- sorts messages by reference path (2 tests)
  - reason: Pending PO migration
  - verdict: add the e2e test
- initializes all messages to empty string when adding new catalog
  - reason: Catalog add watcher
  - verdict: add the e2e test
- preserves flags
  - reason: PO flags
  - verdict: add the e2e test
- removes flags when externally deleted
  - reason: simulateManualFileEdit
  - verdict: add the e2e test
- simulateManualFileEdit + recompile (4 tests)
  - reason: External file write simulation
  - verdict: keep as unit test
- preserves manually added flags in source locale
  - reason: simulateManualFileEdit
  - verdict: add the e2e test
- avoids race condition when saving while loading locale catalogs
  - reason: Race condition
  - verdict: keep as unit test
- propagates read errors instead of silently returning empty
  - reason: Requires chmod 000 / unreadable file
  - verdict: keep as unit test
- returns empty array only for ENOENT errors
  - reason: Error handling
  - verdict: keep as unit test
- propagates parser errors from corrupted/truncated files
  - reason: Corrupt file
  - verdict: keep as unit test
- preserves existing translations when reload reads empty file during external write
  - reason: Race condition
  - verdict: keep as unit test
- folder operations: removes messages when folder deleted
  - reason: Folder delete watcher
  - verdict: add the e2e test
- folder operations: updates messages when folder renamed
  - reason: Folder rename watcher
  - verdict: add the e2e test

## srcPath filtering

- Migrated to e2e/extracted-json-srcpath
  - verdict: no, this should be part of e2e/extracted-json

## Config-dependent

- creates all locale files immediately when explicit locales are provided
  - reason: Requires locales: ['de', 'fr']; needs separate app with different config
  - verdict: keep as unit test
