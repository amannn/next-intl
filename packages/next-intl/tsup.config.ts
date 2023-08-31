import {defineConfig} from 'tsup';
import {globSync} from 'glob';
// https://www.npmjs.com/package/globby
import getBuildConfig, {outDir} from '../../scripts/getBuildConfig';

export default defineConfig([
  ...getBuildConfig({
    entry: {
      index: 'src/index.tsx',
      'index.react-server': 'src/index.react-server.tsx',

      link: 'src/link.tsx',
      'link.react-server': 'src/link.react-server.tsx',

      navigation: 'src/navigation.tsx',
      'navigation.react-server': 'src/navigation.react-server.tsx',

      server: 'src/server.tsx',
      'server.react-server': 'src/server.react-server.tsx',

      client: 'src/client.tsx',
      middleware: 'src/middleware.tsx',
      plugin: 'src/plugin.tsx',
      config: 'src/config.tsx'
    },
    external: ['next-intl/config']
  }),

  // RSC build
  {
    entry: globSync('./src/**/*.tsx').reduce((acc, path) => {
      const key = path.replace(/^src\//, '').replace(/\.tsx$/, '');
      acc[key] = path;
      return acc;
    }, {}),
    outDir: outDir + 'react-server',
    format: ['cjs'],
    clean: true,
    // minify: true,
    bundle: false
  }
]);
