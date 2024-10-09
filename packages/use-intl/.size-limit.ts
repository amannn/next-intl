import type {SizeLimitConfig} from 'size-limit';

const config: SizeLimitConfig = [
  {
    name: './ (ESM)',
    import: '*',
    path: 'dist/esm/index.js',
    limit: '14.195 kB'
  },
  {
    name: './ (no useTranslations, ESM)',
    path: 'dist/esm/index.js',
    import:
      '{IntlProvider, useLocale, useNow, useTimeZone, useMessages, useFormatter}',
    limit: '2.935 kB'
  },
  {
    name: './ (CJS)',
    path: 'dist/production/index.js',
    limit: '15.65 kB'
  }
];

module.exports = config;
