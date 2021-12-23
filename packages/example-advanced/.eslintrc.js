require('eslint-config-molindo/setupPlugins');

module.exports = {
  extends: ['molindo/typescript', 'molindo/react', 'plugin:@next/next/recommended'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'react/display-name': 'off'
  }
}
