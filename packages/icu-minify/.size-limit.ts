import type {SizeLimitConfig} from 'size-limit';

const config: SizeLimitConfig = [
  {
    name: "import format from 'icu-minify/format' (production)",
    import: 'format',
    path: 'dist/esm/production/format.js',
    limit: '0.65 kB'
  },
  {
    name: "import compile from 'icu-minify/compile' (production)",
    import: 'compile',
    path: 'dist/esm/production/compile.js',
    limit: '7.055 kB'
  }
];

module.exports = config;
