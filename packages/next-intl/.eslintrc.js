module.exports = {
  extends: [
    'molindo/typescript',
    'molindo/react',
    'molindo/jest',
    'molindo/cypress'
  ],
  plugins: ['deprecation', 'eslint-plugin-react-compiler'],
  rules: {
    'import/no-useless-path-segments': 'error',
    'react-compiler/react-compiler': 'error',
    '@typescript-eslint/ban-types': 'off'
  },
  overrides: [
    {
      files: ['test/**/*.tsx'],
      rules: {
        'deprecation/deprecation': 'error'
      }
    }
  ]
};
