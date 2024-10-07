import {getPresets} from 'eslint-config-molindo';

export default [
  ...(await getPresets('javascript', 'react')),
  {
    rules: {
      'react/prop-types': 'off'
    }
  }
];
