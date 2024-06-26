/* eslint-env node */
/* eslint-disable import/no-extraneous-dependencies */
import fs, {readFileSync} from 'fs';
import path from 'path';
import {globSync} from 'glob';

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

/**
 * Patch declaration file for shared react-server runtime
 *
 * Workaround for: https://github.com/huozhi/bunchee/issues/547
 */
{
  const result = /\/react-server-shared-[^.]+\.js/.exec(
    readFileSync('./dist/esm/server.d.mts', 'utf8')
  );
  if (!result) {
    throw new Error('Could not find the shared react-server runtime import');
  }
  const filename = result[0].substring(1);
  const newFilename = filename.replace(/\.js$/, '.d.mts');
  patchFile('./dist/esm/server.d.mts', filename, newFilename);

  fs.renameSync(
    path.resolve(process.cwd(), './dist/esm', filename),
    `./dist/esm/${newFilename}`
  );
}

/**
 * Patch file extensions of separated chunks in the ESM build
 *
 * Workaround for: https://github.com/huozhi/bunchee/issues/557
 */
globSync('./dist/esm/**/*.js').forEach((filePath) => {
  const filename = filePath.split('/').pop();
  const newFilename = filename.replace(/\.js$/, '.mjs');

  // rename the file extension
  const newFilePath = filePath.replace(filename, newFilename);
  fs.renameSync(filePath, newFilePath);

  // patch all files in the esm folder that contain a reference to the original .js file
  globSync('./dist/esm/**/*.mjs').forEach((importingFilePath) => {
    patchFile(importingFilePath, filename, newFilename);
  });
});

console.log('\n✔ Patched files in ./dist');
