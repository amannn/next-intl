import fs from 'fs/promises';
import path from 'path';
import SourceFileFilter from './SourceFileFilter.js';

export default class SourceFileScanner {
  private static async walkSourceFiles(
    dir: string,
    srcPaths: Array<string>,
    mdx: boolean,
    acc: Array<string> = []
  ): Promise<Array<string>> {
    const entries = await fs.readdir(dir, {withFileTypes: true});
    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!SourceFileFilter.shouldEnterDirectory(entryPath, srcPaths)) {
          continue;
        }
        await SourceFileScanner.walkSourceFiles(entryPath, srcPaths, mdx, acc);
      } else {
        if (SourceFileFilter.isSourceFile(entry.name, mdx)) {
          acc.push(entryPath);
        }
      }
    }
    return acc;
  }

  public static async getSourceFiles(
    srcPaths: Array<string>,
    mdx = false
  ): Promise<Set<string>> {
    const files = (
      await Promise.all(
        srcPaths.map((srcPath) =>
          SourceFileScanner.walkSourceFiles(srcPath, srcPaths, mdx)
        )
      )
    ).flat();
    return new Set(files);
  }
}
