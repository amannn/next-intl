import type {SizeLimitConfig} from 'size-limit';

const config: SizeLimitConfig = [
  {
    name: './ (ESM)',
    path: 'dist/esm/index.mjs',
    limit: '13.31 kB'
  },
  {
    name: './ (no useTranslations, ESM)',
    path: 'dist/esm/index.mjs',
    import:
      '{useLocale, IntlProvider, useNow, useTimeZone, useMessages, useFormatter}',
    limit: '1.64 kB'
  },
  {
    name: './ (CJS)',
    path: 'dist/cjs/index.js',
    limit: '17.475 kB'
  },
  {
    name: './ (react-server)',
    path: 'dist/esm/index.mjs',
    limit: '13.255 kB'
  },

  {
    name: './navigation (ESM)',
    path: 'dist/esm/navigation.mjs',
    limit: '2.415 kB'
  },
  {
    name: './navigation (CJS)',
    path: 'dist/cjs/navigation.js',
    limit: '19.256 kB'
  },
  {
    name: './navigation (react-server)',
    path: 'dist/esm/navigation.react-server.mjs',
    // React's `cache` could have a side effect, therefore `createTranslator` is bundled
    limit: '14.765 kB' 
  },

  {
    name: './server (ESM)',
    path: 'dist/esm/server.mjs',
    limit: '1 kB'
  },
  {
    name: './server (CJS)',
    path: 'dist/cjs/server.js',
    limit: '1 kB'
  },
  {
    name: './server (react-server)',
    path: 'dist/esm/server.react-server.mjs',
    limit: '13.165 kB'
  },

  {
    name: './middleware (ESM)',
    path: 'dist/esm/middleware.mjs',
    limit: '5.285 kB'
  },
  {
    name: './middleware (CJS)',
    path: 'dist/cjs/middleware.js',
    limit: '5.645 kB'
  },

  {
    name: './routing (ESM)',
    path: 'dist/esm/routing.mjs',
    limit: '1 kB'
  },
  {
    name: './routing (CJS)',
    path: 'dist/cjs/routing.js',
    limit: '1 kB'
  }
];

module.exports = config;
