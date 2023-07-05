/* eslint-disable import/no-extraneous-dependencies */
import {defineConfig} from 'tsup';

export default defineConfig({
  entry: ['src'],
  format: ['cjs', 'esm'],
  splitting: false,
  sourcemap: true,
  clean: true,
  bundle: false,
  dts: true,
  minify: true
});
