import getBuildConfig from '../../scripts/getBuildConfig';

export default getBuildConfig({
  entry: {
    index: 'src/index.tsx',
    core: 'src/core.tsx',
    react: 'src/react.tsx',
    _useLocale: 'src/_useLocale.tsx',
    _IntlProvider: 'src/_IntlProvider.tsx'
  },
  external: ['next-intl/config']
});
