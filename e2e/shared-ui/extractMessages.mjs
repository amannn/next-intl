import {unstable_extractMessages} from 'next-intl/extractor';

await unstable_extractMessages({
  srcPath: './src',
  extract: {
    sourceLocale: 'en',
    locales: 'infer'
  },
  messages: {
    path: './messages',
    format: 'po'
  }
});
