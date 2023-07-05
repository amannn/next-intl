/* eslint-disable import/no-extraneous-dependencies */
import {defineConfig} from 'tsup';
import TsupPluginAddRelativeEsmExtensions from '../../scripts/TsupPluginAddRelativeEsmExtensions';

const config = {
  entry: ['src'],
  format: ['esm', 'cjs'],
  splitting: false,
  sourcemap: true,
  clean: true,
  bundle: false,
  dts: true,
  minify: true,
  plugins: [new TsupPluginAddRelativeEsmExtensions()]
};

export default defineConfig([
  config,

  // TODO: Legacy build, remove with next major
  {
    ...config,
    clean: false,
    outDir: 'dist/src'
  }
]);
