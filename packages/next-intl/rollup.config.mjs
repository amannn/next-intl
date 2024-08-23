/* eslint-env node */
import preserveDirectives from 'rollup-plugin-preserve-directives';
import getBuildConfig from '../../scripts/getBuildConfig.mjs';

const config = {
  input: {
    'index.react-client': 'src/index.react-client.tsx',
    'index.react-server': 'src/index.react-server.tsx',

    'navigation.react-client': 'src/navigation.react-client.tsx',
    'navigation.react-server': 'src/navigation.react-server.tsx',

    'server.react-client': 'src/server.react-client.tsx',
    'server.react-server': 'src/server.react-server.tsx',

    middleware: 'src/middleware.tsx',
    routing: 'src/routing.tsx',
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

export default [
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
