require('eslint-config-molindo/setupPlugins');

module.exports = {
  extends: ['molindo/typescript', 'molindo/react'],
  rules: {
    '@typescript-eslint/no-empty-interface': 'off'
  },

  // The TypeScript parser for ESLint is currently unable to parse these files
  ignorePatterns: ['NestedKeyOf.tsx', 'NestedValueOf.tsx', 'useTranslations.tsx'],
  overrides: [
    {
      files: ['./src/useTranslationsImpl.tsx', './src/utils/**/*.tsx'],
      rules: {
        'import/namespace': 'off',
        'import/default': 'off',
        'import/no-named-as-default-member': 'off'
      }
    }
  ]
};
