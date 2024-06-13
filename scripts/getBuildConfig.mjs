/* eslint-env node */
import fs from 'fs';
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

function writeEnvIndex(input) {
  Object.keys(input).forEach((key) => {
    fs.writeFileSync(
      `./${outDir}${key}.js`,
      `'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./production/${key}.js');
} else {
  module.exports = require('./development/${key}.js');
}
`
    );
  });
}

async function buildTypes() {
  await execa(
    'tsc',
    '--noEmit false --emitDeclarationOnly true --outDir dist/types'.split(' ')
  );
  // eslint-disable-next-line no-console
  console.log('\ncreated types');
}

export default function getConfig({
  env,
  external = [],
  input,
  output,
  plugins = [],
  ...rest
}) {
  /** @type import('rollup').RollupOptions */
  const config = {
    input,
    external: [/node_modules/, ...external],
    output: {
      dir: outDir + env,
      format: 'cjs',
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
            writeEnvIndex(input);
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
