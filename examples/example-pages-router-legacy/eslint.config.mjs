import path from 'path';
import {fileURLToPath} from 'url';
import {FlatCompat} from '@eslint/eslintrc';
import js from '@eslint/js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({
  baseDirectory: __dirname
});

const eslintConfig = [
  js.configs.recommended,
  ...compat.extends('next/core-web-vitals'),
  {
    rules: {
      'react/prop-types': 'off'
    }
  }
];

export default eslintConfig;
