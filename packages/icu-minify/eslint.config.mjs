import {getPresets} from 'eslint-config-molindo';

export default (await getPresets('typescript', 'vitest')).concat({
  rules: {
    // Strict type imports to avoid side effects
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/consistent-type-exports': 'error',
    '@typescript-eslint/no-import-type-side-effects': 'error',
    'import/no-duplicates': ['error', {'prefer-inline': true}],
    'import/extensions': 'error'
  }
});
