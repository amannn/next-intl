/* eslint-env node */
import {babel} from '@rollup/plugin-babel';
import resolve, {
  DEFAULTS as resolveDefaults
} from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import {execa} from 'execa';

const extensions = [...resolveDefaults.extensions, '.tsx'];

const outDir = 'dist/';

async function buildTypes() {
  await execa('tsc', '-p tsconfig.build.json'.split(' '));

  console.log('\ncreated types');
}

function ignoreSideEffectImports(imports) {
  // Rollup somehow leaves a few imports in the bundle that
  // would only be relevant if they had side effects.

  const pattern = imports
    .map((importName) => `import\\s*['"]${importName}['"];?`)
    .join('|');
  const regex = new RegExp(pattern, 'g');

  return {
    name: 'ignore-side-effect-imports',
    generateBundle(outputOptions, bundle) {
      if (imports.length === 0) return;
      for (const fileName in bundle) {
        const file = bundle[fileName];
        if (file.type === 'chunk' && fileName.endsWith('.js')) {
          file.code = file.code.replace(regex, '');
        }
      }
    }
  };
}

function getBundleConfig({
  env,
  external = [],
  input,
  output = undefined,
  plugins = [],
  ...rest
}) {
  /** @type import('rollup').RollupOptions */
  const config = {
    input,
    external: [/node_modules/, ...external],
    output: {
      dir: outDir + 'esm/' + env,
      format: 'es',
      ...output
    },
    treeshake: {
      moduleSideEffects: false,
      preset: 'smallest',
      propertyReadSideEffects: false
    },
    plugins: [
      resolve({extensions}),
      babel({
        babelHelpers: 'bundled',
        extensions,
        presets: [
          '@babel/preset-typescript',
          ['@babel/preset-react', {runtime: 'automatic'}],
          [
            '@babel/preset-env',
            {
              // > 0.5%, last 2 versions, Firefox ESR, not dead
              targets: 'defaults',

              // Maybe a bug in browserslist? This is required for
              // ios<16.3, but MDN says it's available from Safari 10
              exclude: ['transform-parameters']
            }
          ]
        ]
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify(env),
        preventAssignment: true
      }),
      ignoreSideEffectImports(external),
      env !== 'development' && terser(),
      {
        buildEnd() {
          if (env === 'production') {
            buildTypes();
          }
        }
      },
      ...plugins
    ],
    ...rest
  };

  return config;
}

export default function getConfig(config) {
  return [
    getBundleConfig({...config, env: 'development'}),
    getBundleConfig({...config, env: 'production'})
  ];
}
