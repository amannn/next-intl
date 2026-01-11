import {getBuildConfig} from 'tools';

export default getBuildConfig({
  input: {
    index: 'src/index.tsx',
    compiler: 'src/compiler.tsx',
    format: 'src/format.tsx'
  },
  external: ['@formatjs/icu-messageformat-parser']
});
