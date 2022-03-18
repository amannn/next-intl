require('eslint-config-molindo/setupPlugins');

module.exports = {
  extends: ['molindo/typescript', 'molindo/react'],
  // The TypeScript parser for ESLint is currently unable to parse this file
  ignorePatterns: ['NestedKeyOf.tsx']
}
