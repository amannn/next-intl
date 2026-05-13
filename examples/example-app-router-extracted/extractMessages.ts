import {unstable_extractMessages} from 'next-intl/extractor';

// While message extraction integrates automatically with `next dev`
// and `next build`, you can also run it manually.
await unstable_extractMessages({
  messages: {
    path: './messages',
    format: 'po',
    locales: 'infer',
    sourceLocale: 'en'
  },
  srcPath: './src'
});
