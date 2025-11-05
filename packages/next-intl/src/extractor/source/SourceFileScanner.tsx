import fs from 'fs/promises';
import path from 'path';
import SourceFileFilter from './SourceFileFilter.js';

export default class SourceFileScanner {
  private static async walkSourceFiles(
    dir: string,
    srcPaths: Array<string>,
    acc: Array<string> = []
  ): Promise<Array<string>> {
    const entries = await fs.readdir(dir, {withFileTypes: true});
    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await SourceFileScanner.walkSourceFiles(entryPath, srcPaths, acc);
      } else {
        if (SourceFileFilter.isSourceFile(entry.name)) {
          acc.push(entryPath);
        }
      }
    }
    return acc;
  }

  static async getSourceFiles(srcPaths: Array<string>): Promise<Array<string>> {
    return (
      await Promise.all(
        srcPaths.map((srcPath) =>
          SourceFileScanner.walkSourceFiles(srcPath, srcPaths)
        )
      )
    ).flat();
  }
}
