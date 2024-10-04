import * as molindo from 'eslint-config-molindo';

export default [
  ...molindo.javascript,
  ...molindo.react,
  {
    rules: {
      'react/prop-types': 'off'
    }
  }
];
