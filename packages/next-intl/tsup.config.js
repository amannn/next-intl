/* eslint-disable import/no-extraneous-dependencies */
import {defineConfig} from 'tsup';
import TsupPluginAddRelativeEsmExtensions from '../../scripts/TsupPluginAddRelativeEsmExtensions';

export default defineConfig({
  entry: ['src'],
  format: ['esm', 'cjs'],
  splitting: false,
  sourcemap: true,
  clean: true,
  bundle: false,
  dts: true,
  minify: true,
  plugins: [new TsupPluginAddRelativeEsmExtensions()]
});
