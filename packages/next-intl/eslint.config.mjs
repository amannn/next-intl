import * as molindo from 'eslint-config-molindo';
import reactCompilerPlugin from 'eslint-plugin-react-compiler';

export default [
  ...molindo.typescript,
  ...molindo.react,
  ...molindo.vitest,
  {
    plugins: {
      'react-compiler': reactCompilerPlugin
    },
    rules: {
      'react-compiler/react-compiler': 'error'
    }
  }
];
