import path from 'path';
import {fileURLToPath} from 'url';
import {FlatCompat} from '@eslint/eslintrc';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({
  baseDirectory: __dirname
});

export default [
  {
    ignores: ['**/node_modules/*', '.next/*', 'dist/*']
  },
  ...compat.extends('next/core-web-vitals'),
  {
    rules: {
      // Add any custom rules here
    }
  }
];
