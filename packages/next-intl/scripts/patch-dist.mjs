/* eslint-env node */
import fs from 'fs';

function patchFile(filePath, oldString, newString) {
  const data = fs.readFileSync(filePath, 'utf8');
  if (data.includes(newString)) return;
  const updatedData = data.replace(oldString, newString);
  fs.writeFileSync(filePath, updatedData, 'utf8');
}

/**
 * Fix the CJS export of the plugin
 */
patchFile(
  './dist/cjs/plugin.js',
  'exports.default = createNextIntlPlugin;',
  'module.exports = createNextIntlPlugin;module.exports.default = createNextIntlPlugin;'
);
patchFile(
  './dist/cjs/plugin.d.ts',
  'export { createNextIntlPlugin as default };',
  'export = createNextIntlPlugin;'
);
