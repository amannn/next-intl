// eslint-disable-next-line import/order
import {createRequire} from 'module';

const require = createRequire(import.meta.url);
const pkg = require('next/package.json');

function compareVersions(version1: string, version2: string) {
  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const v1 = v1Parts[i] || 0;
    const v2 = v2Parts[i] || 0;
    if (v1 > v2) return 1;
    if (v1 < v2) return -1;
  }
  return 0;
}

const hasStableTurboConfig = compareVersions(pkg.version, '15.3.0') >= 0;
export default hasStableTurboConfig;
