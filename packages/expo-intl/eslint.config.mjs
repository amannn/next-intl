import {getPresets} from 'eslint-config-molindo';

export default (await getPresets('typescript')).concat({
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    // Inside `transformer.tsx` we intentionally use a namespace import for
    // CJS interop with `@expo/metro-config/babel-transformer`.
    'import/no-namespace': 'off'
  }
});
