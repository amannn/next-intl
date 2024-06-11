import type {SizeLimitConfig} from 'size-limit';

const config: SizeLimitConfig = [
  {
    path: 'dist/index.mjs',
    limit: '13.16 kB'
  },
  {
    path: 'dist/index.js',
    limit: '16.81 kB'
  }
];

module.exports = config;
