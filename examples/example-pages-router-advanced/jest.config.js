/* eslint-env node */
const nextJest = require('next/jest');

const createJestConfig = nextJest({dir: './'});

module.exports = async () => ({
  ...(await createJestConfig({
    testEnvironment: 'jsdom',
    rootDir: 'src'
  })()),
  transformIgnorePatterns: ['node_modules/(?!next-intl)/']
});
