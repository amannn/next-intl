import {getPresets} from 'eslint-config-molindo';
import reactCompilerPlugin from 'eslint-plugin-react-compiler';

export default [
  ...(await getPresets('typescript', 'react', 'vitest')),
  {
    plugins: {
      'react-compiler': reactCompilerPlugin
    },
    rules: {
      'react-compiler/react-compiler': 'error'
    }
  }
];
