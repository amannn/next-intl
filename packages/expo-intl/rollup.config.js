import {getBuildConfig} from 'tools';
import pkg from './package.json' with {type: 'json'};

const sharedExternal = [
  ...Object.keys(pkg.dependencies),
  ...Object.keys(pkg.peerDependencies),
  'react/jsx-runtime',
  'use-intl/core',
  'use-intl/react',
  'icu-minify/compile',
  'intl-extractor',
  'intl-extractor/compile-catalog',
  '@expo/metro-config/babel-transformer'
];

export default [
  // ESM (runtime + plugin + extractor entry points)
  ...getBuildConfig({
    input: {
      index: 'src/index.tsx',
      plugin: 'src/plugin.tsx',
      extractor: 'src/extractor.tsx'
    },
    external: sharedExternal,
    output: {
      preserveModules: true
    }
  }),
  // CJS plugin entry (Metro `metro.config.js` is CJS in Expo apps)
  ...getBuildConfig({
    env: ['development'],
    input: {
      plugin: 'src/plugin.tsx'
    },
    external: sharedExternal,
    output: {
      dir: 'dist/cjs/development',
      format: 'cjs',
      entryFileNames: '[name].cjs',
      chunkFileNames: '[name]-[hash].cjs',
      interop: 'compat'
    }
  }),
  // CJS transformer entry (Metro `babelTransformerPath` MUST resolve to CJS)
  ...getBuildConfig({
    env: ['production'],
    input: {
      transformer: 'src/plugin/transformer.tsx'
    },
    external: sharedExternal,
    output: {
      dir: 'dist/cjs/production',
      format: 'cjs',
      entryFileNames: '[name].cjs',
      chunkFileNames: '[name]-[hash].cjs',
      interop: 'compat'
    }
  })
];
