import type {SizeLimitConfig} from 'size-limit';

const config: SizeLimitConfig = [
  {
    name: "import * from 'use-intl' (production)",
    import: '*',
    path: 'dist/esm/production/index.js',
    limit: '12.965 kB'
  },
  {
    name: "import {IntlProvider, useLocale, useNow, useTimeZone, useMessages, useFormatter} from 'use-intl' (production)",
    path: 'dist/esm/production/index.js',
    import:
      '{IntlProvider, useLocale, useNow, useTimeZone, useMessages, useFormatter}',
    limit: '1.975 kB'
  },
  {
    name: "import * from 'use-intl' (development)",
    import: '*',
    path: 'dist/esm/development/index.js',
    limit: '13.905 kB'
  }
];

module.exports = config;
