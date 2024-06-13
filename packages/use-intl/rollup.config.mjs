/* eslint-env node */
import getBuildConfig from '../../scripts/getBuildConfig.mjs';

const input = {
  index: 'src/index.tsx',
  core: 'src/core.tsx',
  react: 'src/react.tsx',
  _useLocale: 'src/_useLocale.tsx',
  _IntlProvider: 'src/_IntlProvider.tsx'
};

export default [
  getBuildConfig({input, env: 'development'}),
  getBuildConfig({
    input,
    env: 'esm',
    output: {format: 'es'}
  }),
  getBuildConfig({input, env: 'production'})
];
