import type {SizeLimitConfig} from 'size-limit';

const config: SizeLimitConfig = [
  {
    name: "import {format} from 'icu-minify/format' (production)",
    import: '{format}',
    path: 'dist/esm/production/format.js',
    limit: '1.1 kB'
  }
];

module.exports = config;
