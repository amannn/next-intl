import {unstable_extractMessages} from 'next-intl/extractor';

await unstable_extractMessages({
  srcPath: './src',
  sourceLocale: 'en',
  messages: {
    path: './messages',
    format: 'json',
    locales: 'infer'
  }
});
