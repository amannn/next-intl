/* eslint-env node */
const nextJest = require('next/jest');

const createJestConfig = nextJest({dir: './'});

module.exports = createJestConfig({
  moduleNameMapper: {
    '^next$': require.resolve('next'),
    '^next/navigation$': require.resolve('next/navigation')
  },
  testEnvironment: 'jsdom',
  rootDir: 'src'
});
