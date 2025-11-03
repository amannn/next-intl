import path from 'path';

export default class SourceFileFilter {
  static readonly EXTENSIONS = ['ts', 'tsx', 'js', 'jsx'];
  private static readonly IGNORED_DIRECTORIES = ['node_modules', '.next'];

  static isSourceFile(filePath: string) {
    const ext = path.extname(filePath);
    return SourceFileFilter.EXTENSIONS.map((cur) => '.' + cur).includes(ext);
  }

  static shouldProcessFile(filePath: string, srcPaths: Array<string>): boolean {
    // Check if the file is within any of the `srcPath`s
    if (!SourceFileFilter.isWithinSrcPath(filePath, srcPaths)) return false;

    // Ignore files in ignored directories unless explicitly asked for
    const isInIgnoredDir = SourceFileFilter.IGNORED_DIRECTORIES.some((dir) =>
      filePath.includes(`/${dir}/`)
    );
    if (isInIgnoredDir) {
      return SourceFileFilter.isIgnoredDirectoryExplicitlyIncluded(
        filePath,
        srcPaths
      );
    }

    return true;
  }

  static shouldEnterDirectory(
    dirPath: string,
    srcPaths: Array<string>
  ): boolean {
    const dirName = path.basename(dirPath);

    // Don't enter ignored directories unless explicitly included
    if (SourceFileFilter.IGNORED_DIRECTORIES.includes(dirName)) {
      return SourceFileFilter.isIgnoredDirectoryExplicitlyIncluded(
        dirPath,
        srcPaths
      );
    }
    return true;
  }

  private static isWithinSrcPath(
    targetPath: string,
    srcPaths: Array<string>
  ): boolean {
    return srcPaths.some((srcPath) =>
      SourceFileFilter.isWithinPath(targetPath, srcPath)
    );
  }

  private static isIgnoredDirectoryExplicitlyIncluded(
    ignoredDirPath: string,
    srcPaths: Array<string>
  ): boolean {
    // Ignored directories should only be entered if a srcPath explicitly points into them
    return srcPaths.some((srcPath) =>
      SourceFileFilter.isWithinPath(srcPath, ignoredDirPath)
    );
  }

  private static isWithinPath(targetPath: string, srcPath: string): boolean {
    return !path.relative(srcPath, targetPath).startsWith('..');
  }
}
