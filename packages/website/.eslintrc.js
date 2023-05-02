require('eslint-config-molindo/setupPlugins');

module.exports = {
  extends: [
    'molindo/typescript',
    'molindo/react',
    'plugin:@next/next/recommended'
  ],
  env: {
    node: true,
    browser: true
  },
  rules: {
    'jsx-a11y/anchor-is-valid': 'off',
    'import/no-unresolved': 'off'
  }
};
