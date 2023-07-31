module.exports = {
  extends: ['molindo/typescript', 'molindo/react', 'molindo/jest'],
  plugins: ['deprecation'],
  overrides: [
    {
      files: ['test/**/*.tsx'],
      rules: {
        'deprecation/deprecation': 'error',
        'import/no-extraneous-dependencies': 'off'
      }
    }
  ]
};
