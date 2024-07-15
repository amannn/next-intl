module.exports = {
  extends: [
    'molindo/typescript',
    'molindo/react',
    'molindo/jest',
    'molindo/cypress'
  ],
  plugins: ['deprecation'],
  rules: {
    'import/no-useless-path-segments': 'error'
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
