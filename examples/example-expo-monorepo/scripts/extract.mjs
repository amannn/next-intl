#!/usr/bin/env node
// Workspace-level extraction. Scans both apps and the shared `packages/ui`
// and writes a single catalog at `examples/example-expo-monorepo/messages/`.
//
// Equivalent to running either app's `pnpm extract` (each app scans the same
// union of sources). This script just gives you a single entry point that
// doesn't depend on which app you happen to have installed.
import {unstable_extractMessages} from 'intl-extractor';

await unstable_extractMessages({
  extract: {path: './messages'},
  srcPath: ['apps/mobile/src', 'apps/web/src', 'packages/ui/src'],
  messages: {
    path: './messages',
    format: 'po',
    locales: ['en', 'de'],
    sourceLocale: 'en'
  }
});

console.log('Extracted messages into messages/{en,de}.po');
