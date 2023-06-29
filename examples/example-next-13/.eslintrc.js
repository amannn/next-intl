require('eslint-config-molindo/setupPlugins');

module.exports = {
  extends: [
    'molindo/typescript',
    'molindo/react',
    'plugin:@next/next/recommended'
  ],
  overrides: [
    {
      files: ['*.spec.tsx'],
      rules: {
        'import/no-extraneous-dependencies': 'off'
      }
    }
  ]
};
