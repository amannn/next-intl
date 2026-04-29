import {unstable_extractMessages} from 'next-intl/extractor';

// While message extraction integrates automatically with `next dev`
// and `next build`, you can also run it manually.
await unstable_extractMessages({
  srcPath: './src',
  messages: {
    path: './messages',
    format: 'po'
  },
  extract: {
    sourceLocale: 'en',
    locales: 'infer'
  }
});
