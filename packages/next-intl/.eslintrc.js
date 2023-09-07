module.exports = {
  extends: [
    'molindo/typescript',
    'molindo/react',
    'molindo/jest',
    'molindo/cypress'
  ],
  plugins: ['deprecation'],
  overrides: [
    {
      files: ['test/**/*.tsx'],
      rules: {
        'deprecation/deprecation': 'error'
      }
    }
  ]
};
