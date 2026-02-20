# Tests dropped during ExtractionCompiler E2E migration

Tests that could not be migrated to e2e or proved unreliable.

## JSON format

| Test                                                                               | Reason                                                                       |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| creates the messages directory and source catalog when they do not exist initially | App requires messages to exist for getRequestConfig to load; chicken-and-egg |
| writes to newly added catalog file                                                 | Catalog watcher (messages/ add) may not trigger extraction reliably in e2e   |
| preserves existing translations when adding a catalog file                         | Same – catalog add watcher                                                   |
| stops writing to removed catalog file                                              | Catalog remove + re-extraction timing unreliable                             |
| initializes all messages to empty string when adding new catalog                   | Catalog add watcher                                                          |
| restores previous translations when messages are added back                        | Predicate timing – app has Footer with Hey! so state differs from unit test  |
| preserves manual translations in target catalogs when adding new messages          | Multi-step flow; de.json state across edits unreliable                       |
| avoids race condition when compiling while a new locale is added                   | Race condition – requires readFile interceptors                              |
| avoids race condition when watcher processes files during initial scan             | Race condition – requires readFile interceptors                              |
| ignores parse error from watcher and waits for next file update                    | Parse error may leave extraction in bad state; recovery timing unreliable    |

## PO format

| Test                                                                               | Reason                                                    |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------- |
| tracks all line numbers when same message appears multiple times in one file       | Needs multi-file setup; migrate when PO suite is expanded |
| saves changes to descriptions                                                      | Pending PO migration                                      |
| combines references from multiple files                                            | Pending PO migration                                      |
| merges descriptions when message appears in multiple files                         | Pending PO migration                                      |
| updates references in all catalogs when message is reused                          | Pending PO migration                                      |
| removes references when a message is dropped from a single file                    | Pending PO migration                                      |
| removes obsolete messages during build                                             | Uses isDevelopment: false – build mode                    |
| removes messages when a file is deleted during dev                                 | File delete watcher                                       |
| removes obsolete references after file rename (3 variants)                         | File rename watcher                                       |
| supports namespaces                                                                | Pending PO migration                                      |
| retains metadata when saving back to file                                          | PO metadata handling                                      |
| sorts messages by reference path (2 tests)                                         | Pending PO migration                                      |
| initializes all messages to empty string when adding new catalog                   | Catalog add watcher                                       |
| preserves flags                                                                    | PO flags                                                  |
| removes flags when externally deleted                                              | simulateManualFileEdit                                    |
| simulateManualFileEdit + recompile (4 tests)                                       | External file write simulation                            |
| preserves manually added flags in source locale                                    | simulateManualFileEdit                                    |
| avoids race condition when saving while loading locale catalogs                    | Race condition                                            |
| propagates read errors instead of silently returning empty                         | Requires chmod 000 / unreadable file                      |
| returns empty array only for ENOENT errors                                         | Error handling                                            |
| propagates parser errors from corrupted/truncated files                            | Corrupt file                                              |
| preserves existing translations when reload reads empty file during external write | Race condition                                            |
| folder operations: removes messages when folder deleted                            | Folder delete watcher                                     |
| folder operations: updates messages when folder renamed                            | Folder rename watcher                                     |

## srcPath filtering

Migrated to e2e/extracted-json-srcpath.

## Config-dependent

| Test                                                                    | Reason                                                                   |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| creates all locale files immediately when explicit locales are provided | Requires locales: ['de', 'fr']; needs separate app with different config |
