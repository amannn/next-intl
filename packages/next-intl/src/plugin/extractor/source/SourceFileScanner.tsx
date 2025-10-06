import {promises as fs} from 'fs';
import path from 'path';
import SourceFileAnalyzer from './SourceFileAnalyzer.js';

export default class SourceFileScanner {
  private static async walkSourceFiles(
    dir: string,
    acc: Array<string> = []
  ): Promise<Array<string>> {
    const entries = await fs.readdir(dir, {withFileTypes: true});
    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (SourceFileAnalyzer.IGNORED_DIRECTORIES.includes(entryPath)) {
          continue;
        }
        await SourceFileScanner.walkSourceFiles(entryPath, acc);
      } else {
        if (SourceFileAnalyzer.isSourceFile(entry.name)) {
          acc.push(entryPath);
        }
      }
    }
    return acc;
  }

  static async getSourceFiles(srcPaths: Array<string>): Promise<Array<string>> {
    return (
      await Promise.all(
        srcPaths.map((srcPath) => SourceFileScanner.walkSourceFiles(srcPath))
      )
    ).flat();
  }
}
