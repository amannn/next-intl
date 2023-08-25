module.exports = {
  extends: ['molindo/typescript', 'molindo/react'],
  overrides: [
    {
      files: ['test/**/*.{ts,tsx}'],
      rules: {
        'import/no-extraneous-dependencies': 'off'
      }
    }
  ]
};
