/* eslint-env node */
const preserveDirectives = require('rollup-plugin-preserve-directives').default;
const getBuildConfig = require('../../scripts/getBuildConfig');

const config = {
  input: {
    'index.react-client': 'src/index.react-client.tsx',
    'index.react-server': 'src/index.react-server.tsx',

    'navigation.react-client': 'src/navigation.react-client.tsx',
    'navigation.react-server': 'src/navigation.react-server.tsx',

    server: 'src/server.tsx',

    middleware: 'src/middleware.tsx',
    plugin: 'src/plugin.tsx',
    config: 'src/config.tsx'
  },
  external: ['next-intl/config', /use-intl/],
  output: {
    preserveModules: true
  },
  onwarn(warning, warn) {
    if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
    warn(warning);
  },
  plugins: [preserveDirectives()]
};

module.exports = [
  getBuildConfig({
    ...config,
    env: 'development'
  }),
  getBuildConfig({
    ...config,
    output: {
      ...config.output,
      format: 'es'
    },
    env: 'esm'
  }),
  getBuildConfig({
    ...config,
    env: 'production'
  })
];
