module.exports = {
  env: {
    node: true
  },
  parserOptions: {
    sourceType: 'module'
  },
  extends: [
    'molindo/javascript',
    'molindo/react',
    'plugin:@next/next/recommended'
  ],
  rules: {
    'react/prop-types': 'off'
  }
};
