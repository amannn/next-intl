import {getBuildConfig} from 'tools';
import pkg from './package.json' with {type: 'json'};

export default getBuildConfig({
  input: {
    index: 'src/index.tsx',
    'compile-catalog': 'src/compile-catalog.tsx'
  },
  external: [
    ...Object.keys(pkg.dependencies),
    'icu-minify/compile',
    'node:fs',
    'node:fs/promises',
    'node:path',
    'node:url',
    'node:module',
    'node:crypto',
    'node:os',
    'fs',
    'fs/promises',
    'path',
    'url',
    'module',
    'crypto',
    'os'
  ],
  output: {
    preserveModules: true
  }
});
