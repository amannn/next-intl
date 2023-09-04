/* eslint-env node */
const fs = require('fs');
const {babel} = require('@rollup/plugin-babel');
const commonjs = require('@rollup/plugin-commonjs');
const resolve = require('@rollup/plugin-node-resolve');
const replace = require('@rollup/plugin-replace');
const terser = require('@rollup/plugin-terser');
const execa = require('execa');

const extensions = [...resolve.DEFAULTS.extensions, '.tsx'];

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

module.exports = function getConfig({
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
      ...output,
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
                browsers: ['>0.25%', 'not ie 11', 'not op_mini all']
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
};
