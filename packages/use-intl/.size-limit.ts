import type {SizeLimitConfig} from 'size-limit';

const config: SizeLimitConfig = [
  {
    name: './ (ESM)',
    path: 'dist/esm/index.mjs',
    limit: '15.25 kB'
  },
  {
    name: './ (no useTranslations, ESM)',
    path: 'dist/esm/index.mjs',
    import:
      '{useLocale, IntlProvider, useNow, useTimeZone, useMessages, useFormatter}',
    limit: '1.825 kB'
  },
  {
    name: './ (CJS)',
    path: 'dist/cjs/index.js',
    limit: '19.775 kB'
  }
];

module.exports = config;
