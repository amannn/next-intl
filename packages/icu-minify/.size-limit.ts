import type {SizeLimitConfig} from 'size-limit';

const config: SizeLimitConfig = [
  {
    name: "import {format} from 'icu-minify/format' (production)",
    import: '{format}',
    path: 'dist/esm/production/format.js',
    limit: '1.1 kB'
  },
  {
    name: "import {compile} from 'icu-minify/compiler' (production, excluding parser)",
    import: '{compile}',
    path: 'dist/esm/production/compiler.js',
    limit: '1 kB',
    ignore: ['@formatjs/icu-messageformat-parser']
  }
];

module.exports = config;
