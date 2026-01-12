import {getBuildConfig} from 'tools';

export default getBuildConfig({
  input: {
    compiler: 'src/compiler.tsx',
    format: 'src/format.tsx'
  },
  external: ['@formatjs/icu-messageformat-parser']
});
