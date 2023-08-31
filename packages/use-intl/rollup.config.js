/* eslint-env node */
const getBuildConfig = require('../../scripts/getBuildConfig');

const input = {
  index: 'src/index.tsx',
  core: 'src/core.tsx',
  react: 'src/react.tsx',
  _useLocale: 'src/_useLocale.tsx',
  _IntlProvider: 'src/_IntlProvider.tsx'
};

module.exports = [
  getBuildConfig({input, env: 'development'}),
  getBuildConfig({input, env: 'production'})
];
