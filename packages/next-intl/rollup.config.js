import preserveDirectives from 'rollup-plugin-preserve-directives';
import getBuildConfig from '../../scripts/getBuildConfig.mjs';
import pkg from './package.json' with {type: 'json'};

export default [
  ...getBuildConfig({
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
    external: [
      ...Object.keys(pkg.dependencies),
      ...Object.keys(pkg.peerDependencies),
      'react/jsx-runtime',
      'next-intl/config',
      'use-intl/core',
      'use-intl/react'
    ],
    output: {
      preserveModules: true
    },
    onwarn(warning, warn) {
      if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
      warn(warning);
    },
    plugins: [preserveDirectives()]
  }),
  ...getBuildConfig({
    env: ['production'],
    input: {
      plugin: 'src/plugin.tsx'
    },
    output: {
      dir: 'dist/cjs/production',
      format: 'cjs',
      entryFileNames: '[name].cjs'
    }
  })
];
