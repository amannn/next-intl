import {unstable_extractMessages} from 'next-intl/extractor';

await unstable_extractMessages({
  extract: {
    sourceLocale: 'en',
    locales: 'infer',
    srcPath: './src'
  },
  messages: {
    format: 'po',
    path: './messages'
  }
});
