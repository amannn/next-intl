#!/usr/bin/env node
// Extracts into the shared workspace catalog. Scans this app's source plus
// the sibling mobile app and the shared `packages/ui` so a single run produces
// the full set of messages.
import {unstable_extractMessages} from 'next-intl/extractor';

await unstable_extractMessages({
  extract: {path: '../../messages'},
  srcPath: ['./src', '../mobile/src', '../../packages/ui/src'],
  messages: {
    path: '../../messages',
    format: 'po',
    locales: ['en', 'de'],
    sourceLocale: 'en'
  }
});

console.log('Extracted messages into ../../messages/{en,de}.po');
