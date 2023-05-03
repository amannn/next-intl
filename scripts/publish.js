// @ts-check

const execa = require('execa');
const fs = require('fs');

(async function () {
  // Use `npm` as a client for lerna to be able to use provenance
  const lernaConfig = JSON.parse(fs.readFileSync('lerna.json', 'utf-8'));
  lernaConfig.npmClient = 'npm';
  fs.writeFileSync('lerna.json', JSON.stringify(lernaConfig, null, 2));

  await execa('lerna', ['publish', '--yes', '--no-verify-access'], {
    stdio: 'inherit'
  });
})();
