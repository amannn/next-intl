import type {SizeLimitConfig} from 'size-limit';

const config: SizeLimitConfig = [
  {
    name: './ (ESM)',
    path: 'dist/esm/index.mjs',
    limit: '13.405 kB'
  },
  {
    name: './ (no useTranslations, ESM)',
    path: 'dist/esm/index.mjs',
    import:
      '{IntlProvider, useLocale, useNow, useTimeZone, useMessages, useFormatter}',
    limit: '1.825 kB'
  },
  {
    name: './ (CJS)',
    path: 'dist/cjs/index.js',
    limit: '17.475 kB'
  }
];

module.exports = config;
