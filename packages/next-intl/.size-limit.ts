import type {SizeLimitConfig} from 'size-limit';

const config: SizeLimitConfig = [
  {
    name: "import * from 'next-intl' (react-client)",
    path: 'dist/esm/production/index.react-client.js',
    limit: '13.065 KB'
  },
  {
    name: "import {NextIntlClientProvider} from 'next-intl' (react-client)",
    import: '{NextIntlClientProvider}',
    path: 'dist/esm/production/index.react-client.js',
    limit: '1 KB'
  },
  {
    name: "import * from 'next-intl' (react-server)",
    path: 'dist/esm/production/index.react-server.js',
    limit: '14.035 KB'
  },
  {
    name: "import {createNavigation} from 'next-intl/navigation' (react-client)",
    path: 'dist/esm/production/navigation.react-client.js',
    import: '{createNavigation}',
    limit: '2.475 KB'
  },
  {
    name: "import {createNavigation} from 'next-intl/navigation' (react-server)",
    path: 'dist/esm/production/navigation.react-server.js',
    import: '{createNavigation}',
    limit: '3.25 KB'
  },
  {
    name: "import * from 'next-intl/server' (react-client)",
    path: 'dist/esm/production/server.react-client.js',
    limit: '1 KB'
  },
  {
    name: "import * from 'next-intl/server' (react-server)",
    path: 'dist/esm/production/server.react-server.js',
    limit: '13.335 KB'
  },
  {
    name: "import * from 'next-intl/middleware'",
    path: 'dist/esm/production/middleware.js',
    limit: '9.305 KB'
  },
  {
    name: "import * from 'next-intl/routing'",
    path: 'dist/esm/production/routing.js',
    limit: '1 KB'
  }
];

module.exports = config;
