import type {SizeLimitConfig} from 'size-limit';

const config: SizeLimitConfig = [
  {
    name: 'All (ESM)',
    path: 'dist/index.mjs',
    limit: '13.16 kB'
  },
  {
    name: 'All but useTranslations (ESM)',
    path: 'dist/index.mjs',
    import:
      '{useLocale, IntlProvider, useNow, useTimeZone, useMessages, useFormatter}',
    limit: '1.58 kB'
  },
  {
    name: 'All (CJS)',
    path: 'dist/index.js',
    limit: '16.81 kB'
  }
];

module.exports = config;
