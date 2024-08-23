module.exports = {
  extends: ['molindo/typescript', 'molindo/react'],
  plugins: ['eslint-plugin-react-compiler'],
  rules: {
    'import/no-useless-path-segments': 'error',
    'react-compiler/react-compiler': 'error'
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
