import path from 'path';

export default class SourceFileFilter {
  static readonly EXTENSIONS = ['ts', 'tsx', 'js', 'jsx'];

  static isSourceFile(filePath: string) {
    const ext = path.extname(filePath);
    return SourceFileFilter.EXTENSIONS.map((cur) => '.' + cur).includes(ext);
  }

  static shouldProcessFile(filePath: string, srcPaths: Array<string>): boolean {
    // Check if the file is within any of the `srcPath`s
    if (!SourceFileFilter.isWithinSrcPath(filePath, srcPaths)) return false;

    // Ignore files in node_modules unless explicitly asked for
    if (filePath.includes('/node_modules/')) {
      return SourceFileFilter.isNodeModulesExplicitlyIncluded(
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
    // Don't enter node_modules directories unless explicitly included
    if (path.basename(dirPath) === 'node_modules') {
      return SourceFileFilter.isNodeModulesExplicitlyIncluded(
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

  private static isNodeModulesExplicitlyIncluded(
    nodeModulesPath: string,
    srcPaths: Array<string>
  ): boolean {
    // node_modules should only be entered if a srcPath explicitly points into it
    return srcPaths.some((srcPath) =>
      SourceFileFilter.isWithinPath(srcPath, nodeModulesPath)
    );
  }

  private static isWithinPath(targetPath: string, srcPath: string): boolean {
    return !path.relative(srcPath, targetPath).startsWith('..');
  }
}
