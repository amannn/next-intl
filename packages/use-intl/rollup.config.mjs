import getBuildConfig from '../../scripts/getBuildConfig.mjs';

export default getBuildConfig({
  input: {
    index: 'src/index.tsx',
    core: 'src/core.tsx',
    react: 'src/react.tsx'
  },
  external: [
    'intl-messageformat',
    'react',
    'react/jsx-runtime',
    '@formatjs/fast-memoize'
  ]
});
