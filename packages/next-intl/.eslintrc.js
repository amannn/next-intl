require('eslint-config-molindo/setupPlugins');

module.exports = {
  extends: ['molindo/typescript', 'molindo/react'],
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
