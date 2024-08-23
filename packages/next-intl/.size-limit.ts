import type {SizeLimitConfig} from 'size-limit';

const config: SizeLimitConfig = [
  {
    path: 'dist/production/index.react-client.js',
    limit: '14.095 KB'
  },
  {
    path: 'dist/production/index.react-server.js',
    limit: '14.675 KB'
  },
  {
    path: 'dist/production/navigation.react-client.js',
    limit: '3.155 KB'
  },
  {
    path: 'dist/production/navigation.react-server.js',
    limit: '15.975 KB'
  },
  {
    path: 'dist/production/server.react-client.js',
    limit: '1 KB'
  },
  {
    path: 'dist/production/server.react-server.js',
    limit: '13.975 KB'
  },
  {
    path: 'dist/production/middleware.js',
    limit: '9.535 KB'
  },
  {
    path: 'dist/production/routing.js',
    limit: '0 KB'
  },
  {
    path: 'dist/esm/index.react-client.js',
    import: '*',
    limit: '14.265 kB'
  },
  {
    path: 'dist/esm/index.react-client.js',
    import: '{NextIntlClientProvider}',
    limit: '1.425 kB'
  }
];

module.exports = config;
