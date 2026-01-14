import preserveDirectives from 'rollup-plugin-preserve-directives';
import {getBuildConfig} from 'tools';
import pkg from './package.json' with {type: 'json'};

function rewriteBundle(regex, replaceFn) {
  return {
    name: 'rewrite-bundle',
    generateBundle(options, bundle) {
      for (const fileName of Object.keys(bundle)) {
        const chunk = bundle[fileName];
        const updatedCode = chunk.code.replace(regex, replaceFn);
        chunk.code = updatedCode;
      }
    }
  };
}

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
      config: 'src/config.tsx',
      extractor: 'src/extractor.tsx',
      'extractor/extractionLoader': 'src/plugin/extractor/extractionLoader.tsx',
      'extractor/catalogLoader': 'src/plugin/catalog/catalogLoader.tsx'
    },
    external: [
      ...Object.keys(pkg.dependencies),
      ...Object.keys(pkg.peerDependencies),
      'react/jsx-runtime',
      'next-intl/config',
      'use-intl/core',
      'use-intl/react',
      // icu-minify subpath exports need to be explicitly externalized
      // (used by catalogLoader.tsx and format-only.tsx)
      'icu-minify/compiler',
      'icu-minify/format'
    ],
    output: {
      preserveModules: true
    },
    onwarn(warning, warn) {
      if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
      warn(warning);
    },
    plugins: [
      preserveDirectives(),

      // Since we're writing our code with ESM, we have to import e.g. from
      // `next/link.js`. While this can be used in production, since Next.js 15
      // this somehow causes hard reloads when `next/link.js` is imported and
      // used to link to another page. There might be some optimizations
      // happening in the background that we can't control. Due to this, it
      // seems safer to update imports to a version that doesn't have `.js`
      // suffix and let the bundler optimize them.
      rewriteBundle(/['"]next\/(\w+)\.js['"]/g, (match, p1) =>
        match.replace(`next/${p1}.js`, `next/${p1}`)
      )
    ]
  }),
  ...getBuildConfig({
    env: ['development'],
    input: {
      plugin: 'src/plugin.tsx'
    },
    output: {
      dir: 'dist/cjs/development',
      format: 'cjs',
      entryFileNames: '[name].cjs',
      chunkFileNames: '[name]-[hash].cjs',
      interop: 'compat'
    }
  })
];
