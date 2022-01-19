require('eslint-config-molindo/setupPlugins');

module.exports = {
  extends: ['molindo/typescript', 'molindo/react'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/display-name': 'off'
  }
}
