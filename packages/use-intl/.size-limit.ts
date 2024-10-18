import type {SizeLimitConfig} from 'size-limit';

const config: SizeLimitConfig = [
  {
    name: "import * from 'use-intl' (ESM)",
    import: '*',
    path: 'dist/esm/index.js',
    limit: '14.125 kB'
  },
  {
    name: "import {IntlProvider, useLocale, useNow, useTimeZone, useMessages, useFormatter} from 'use-intl' (ESM)",
    path: 'dist/esm/index.js',
    import:
      '{IntlProvider, useLocale, useNow, useTimeZone, useMessages, useFormatter}',
    limit: '2.865 kB'
  },
  {
    name: "import * from 'use-intl' (CJS)",
    path: 'dist/production/index.js',
    limit: '15.65 kB'
  }
];

module.exports = config;
