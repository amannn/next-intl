module.exports = {
  extends: [
    'molindo/typescript',
    'molindo/react',
    'molindo/tailwind',
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
