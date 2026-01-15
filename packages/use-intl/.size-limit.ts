import type {SizeLimitConfig} from 'size-limit';

const config: SizeLimitConfig = [
  {
    name: "import * from 'use-intl' (production)",
    import: '*',
    path: 'dist/esm/production/index.js',
    limit: '13.205 kB'
  },
  {
    name: "import {IntlProvider, useLocale, useNow, useTimeZone, useMessages, useFormatter} from 'use-intl' (production)",
    path: 'dist/esm/production/index.js',
    import:
      '{IntlProvider, useLocale, useNow, useTimeZone, useMessages, useFormatter}',
    limit: '2.025 kB'
  }
];

module.exports = config;
