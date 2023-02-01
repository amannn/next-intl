require('eslint-config-molindo/setupPlugins');

module.exports = {
  env: {
    node: true
  },
  extends: [
    'molindo/typescript',
    'molindo/react',
    'plugin:@next/next/recommended'
  ],
  rules: {
    'react/react-in-jsx-scope': 'off'
  },
  overrides: [
    {
      files: ['src/i18n.tsx'],
      rules: {
        'func-style': 'off'
      }
    }
  ]
};
