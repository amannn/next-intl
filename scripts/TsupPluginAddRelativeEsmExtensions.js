import {existsSync, readFileSync, statSync, writeFileSync} from 'fs';
import path from 'path';
import glob from 'glob';
import {parse, print, visit} from 'recast';

// See:
// - https://github.com/evanw/esbuild/issues/622#issuecomment-1480099602
// - https://gist.github.com/ds300/f6177171ac673f98f6028799563a06db

const extensions = ['.mjs', '.js', '.cjs'];

function resolveRelativePath(importingFile, relativePath) {
  if (!relativePath.startsWith('.')) {
    return relativePath;
  }

  const containingDir = path.dirname(importingFile);

  if (
    existsSync(path.join(containingDir, relativePath)) &&
    !statSync(path.join(containingDir, relativePath)).isDirectory()
  ) {
    // If the file already exists, e.g. .css files, just use it
    return relativePath;
  }

  // Strip the file extension if applicable
  relativePath.replace(/\.(m|c)?js$/, '');

  for (const extension of extensions) {
    if (relativePath.endsWith(extension)) {
      return relativePath;
    } else {
      let candidate = `${relativePath}${extension}`;
      if (existsSync(path.join(containingDir, candidate))) {
        return candidate;
      }

      candidate = `${relativePath}/index${extension}`;

      if (existsSync(path.join(containingDir, candidate))) {
        return candidate;
      }
    }
  }

  throw new Error(
    `Could not resolve relative path ${relativePath} from ${importingFile}`
  );
}

function addExtensions(distDir) {
  for (const file of glob.sync(path.join(distDir, '**/*.{mjs,cjs,js}'))) {
    const code = parse(readFileSync(file, 'utf8'), {
      parser: require('recast/parsers/typescript')
    });

    visit(code, {
      visitImportDeclaration(path) {
        path.value.source.value = resolveRelativePath(
          file,
          path.value.source.value
        );
        return false;
      },
      visitExportAllDeclaration(path) {
        path.value.source.value = resolveRelativePath(
          file,
          path.value.source.value
        );
        return false;
      },
      visitExportNamedDeclaration(path) {
        if (path.value.source) {
          path.value.source.value = resolveRelativePath(
            file,
            path.value.source.value
          );
        }
        return false;
      }
    });

    writeFileSync(file, print(code).code);
  }
}

function TsupPluginAddRelativeEsmExtensions(distFolder = 'dist') {
  return {
    name: 'TsupPluginAddRelativeEsmExtensions',
    buildEnd(context) {
      const isEsmBuild = context.writtenFiles.some((file) =>
        file.name.endsWith('.mjs')
      );
      if (!isEsmBuild) return;
      addExtensions(distFolder);
    }
  };
}

export default TsupPluginAddRelativeEsmExtensions;
