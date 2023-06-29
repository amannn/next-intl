const nextJest = require('next/jest');

const createJestConfig = nextJest({dir: './'});

module.exports = createJestConfig({
  testEnvironment: 'jsdom',
  rootDir: 'src'
});
