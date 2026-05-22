import {getPresets} from 'eslint-config-molindo';

export default (await getPresets('typescript')).concat({
  rules: {
    '@typescript-eslint/no-explicit-any': 'off'
  }
});
