/* eslint-env node */
import {babel} from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
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
      interop: 'auto',
      freeze: false,
      esModule: true,
      exports: 'named',
      ...output
    },
    treeshake: {
      moduleSideEffects: false,
      preset: 'smallest',
      propertyReadSideEffects: false
    },
    plugins: [
      resolve({extensions}),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        extensions,
        presets: [
          '@babel/preset-typescript',
          '@babel/preset-react',
          [
            '@babel/preset-env',
            {
              targets: {
                // Same as https://nextjs.org/docs/architecture/supported-browsers#browserslist
                browsers: [
                  'chrome 64',
                  'edge 79',
                  'firefox 67',
                  'opera 51',
                  'safari 12'
                ]
              }
            }
          ]
        ]
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify(env),
        preventAssignment: true
      }),
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
