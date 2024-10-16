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
    'react-compiler/react-compiler': 'error'
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
