import {unstable_extractMessages} from 'next-intl/extractor';

// While message extraction integrates automatically with `next dev`
// and `next build`, you can also run it manually.
await unstable_extractMessages({
  extract: {
    locales: 'infer',
    sourceLocale: 'en',
    srcPath: './src'
  },
  messages: {
    format: 'po',
    path: './messages'
  }
});
