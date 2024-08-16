module.exports = {
  extends: ['molindo/typescript', 'molindo/react'],
  rules: {
    'import/no-useless-path-segments': 'error'
  },
  overrides: [
    {
      files: ['*.test.tsx'],
      rules: {
        'import/no-extraneous-dependencies': 'off'
      }
    }
  ]
};
