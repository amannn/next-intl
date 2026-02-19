import fs from 'fs';
import path from 'path';

export const ROUTE_SIBLING_NAMES = [
  'page',
  'loading',
  'error',
  'default',
  'template',
  'not-found'
];

export function getSiblingRouteFiles(layoutPath: string): Array<string> {
  const dir = path.dirname(layoutPath);
  const ext = path.extname(layoutPath);
  const altExt = ext === '.tsx' ? '.ts' : '.tsx';
  const found: Array<string> = [];

  for (const name of ROUTE_SIBLING_NAMES) {
    const sibling = path.join(dir, `${name}${ext}`);
    if (fs.existsSync(sibling)) found.push(sibling);
    const altSibling = path.join(dir, `${name}${altExt}`);
    if (altSibling !== sibling && fs.existsSync(altSibling)) {
      found.push(altSibling);
    }
  }

  const entries = fs.readdirSync(dir, {withFileTypes: true});
  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.startsWith('@')) continue;
    const slotDir = path.join(dir, entry.name);
    for (const name of ROUTE_SIBLING_NAMES) {
      const sibling = path.join(slotDir, `${name}${ext}`);
      if (fs.existsSync(sibling)) found.push(sibling);
      const altSibling = path.join(slotDir, `${name}${altExt}`);
      if (altSibling !== sibling && fs.existsSync(altSibling)) {
        found.push(altSibling);
      }
    }
  }
  return found;
}
