import {execSync} from 'child_process';

const output = execSync(
  'madge --ts-config tsconfig.json --extensions ts,tsx --orphans src/',
  {encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']}
).toString();

const lines = output.split('\n');
const orphans = lines
  .filter(line => line.trim() && !line.includes('Finding files') && !line.includes('Processed'))
  .filter(line => {
    const path = line.trim();
    if (!path) return false;
    if (path === 'i18n/request.ts') return false;
    if (/^app\/(.*\/)?(page|layout|loading|template|error|not-found|default)\.tsx?$/.test(path)) {
      return false;
    }
    return true;
  });

if (orphans.length > 0) {
  console.error('Error: Orphan files detected:');
  orphans.forEach(orphan => console.error(orphan));
  process.exit(1);
}
