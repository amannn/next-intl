module.exports = {
  env: {
    node: true
  },
  extends: [
    'molindo/typescript',
    'molindo/react',
    'plugin:@next/next/recommended',
    'plugin:storybook/recommended'
  ],
  rules: {
    'react/react-in-jsx-scope': 'off'
  }
};
