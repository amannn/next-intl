import type {SizeLimitConfig} from 'size-limit';

const config: SizeLimitConfig = [
  {
    name: './ (ESM)',
    import: '*',
    path: 'dist/esm/index.js',
    limit: '14.065 kB'
  },
  {
    name: './ (no useTranslations, ESM)',
    path: 'dist/esm/index.js',
    import:
      '{IntlProvider, useLocale, useNow, useTimeZone, useMessages, useFormatter}',
    limit: '2.865 kB'
  },
  {
    name: './ (CJS)',
    path: 'dist/production/index.js',
    limit: '15.65 kB'
  }
];

module.exports = config;
