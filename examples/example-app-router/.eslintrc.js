module.exports = {
  env: {
    node: true
  },
  extends: [
    'molindo/typescript',
    'molindo/react',
    'molindo/tailwind',
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
