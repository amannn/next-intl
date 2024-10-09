import type {SizeLimitConfig} from 'size-limit';

const config: SizeLimitConfig = [
  {
    name: "import * from 'use-intl' (ESM)",
    import: '*',
    path: 'dist/esm/index.js',
    limit: '14.195 kB'
  },
  {
    name: "import {IntlProvider, useLocale, useNow, useTimeZone, useMessages, useFormatter} from 'use-intl' (ESM)",
    path: 'dist/esm/index.js',
    import:
      '{IntlProvider, useLocale, useNow, useTimeZone, useMessages, useFormatter}',
    limit: '2.935 kB'
  },
  {
    name: "import * from 'use-intl' (CJS)",
    path: 'dist/production/index.js',
    limit: '13.695 kB'
  }
];

module.exports = config;
