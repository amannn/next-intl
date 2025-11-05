import {unstable_extractMessages} from 'next-intl/extractor';

// While message extraction integrates automatically with `next dev`
// and `next build`, you can also run it manually.
await unstable_extractMessages({
  srcPath: './src',
  sourceLocale: 'en',
  messages: {
    path: './messages',
    format: 'json',
    locales: 'infer'
  }
});
