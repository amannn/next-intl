require('eslint-config-molindo/setupPlugins');

module.exports = {
  extends: [
    'molindo/typescript',
    'molindo/react',
    'plugin:@next/next/recommended'
  ],
  rules: {
    'react/react-in-jsx-scope': 'off'
  }
};
