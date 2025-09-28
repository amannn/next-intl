import {promises as fs} from 'fs';
import path from 'path';
import SourceFileAnalyzer from './SourceFileAnalyzer.ts';

// SourceFileAnalyzer - it a source file?
// SourceFileWatcher - watch all source files
// SourceFileScanner - scan all source files

export default class SourceFileScanner {
  static readonly IGNORED_DIRECTORIES = ['node_modules'];

  private static async walkSourceFiles(
    dir: string,
    acc: Array<string> = []
  ): Promise<Array<string>> {
    const entries = await fs.readdir(dir, {withFileTypes: true});
    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (SourceFileScanner.IGNORED_DIRECTORIES.includes(entryPath)) continue;
        await SourceFileScanner.walkSourceFiles(entryPath, acc);
      } else {
        if (SourceFileAnalyzer.isSourceFile(entry.name)) {
          acc.push(entryPath);
        }
      }
    }
    return acc;
  }

  static async getSourceFiles(srcPath: string): Promise<Array<string>> {
    return await SourceFileScanner.walkSourceFiles(srcPath);
  }
}
