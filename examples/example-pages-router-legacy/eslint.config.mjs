import {getPresets} from 'eslint-config-molindo';

export default (await getPresets('javascript', 'react')).concat({
  rules: {
    'react/prop-types': 'off'
  }
});
