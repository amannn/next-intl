import path from 'path';

export default class SourceFileFilter {
  public static readonly EXTENSIONS = ['ts', 'tsx', 'js', 'jsx'];

  // Will not be entered, except if explicitly asked for
  // TODO: At some point we should infer these from .gitignore
  public static readonly IGNORED_DIRECTORIES = [
    'node_modules',
    '.next',
    '.git'
  ];

  public static isSourceFile(filePath: string) {
    const ext = path.extname(filePath);
    return SourceFileFilter.EXTENSIONS.map((cur) => '.' + cur).includes(ext);
  }

  public static shouldEnterDirectory(
    dirPath: string,
    srcPaths: Array<string>
  ): boolean {
    const dirName = path.basename(dirPath);
    if (SourceFileFilter.IGNORED_DIRECTORIES.includes(dirName)) {
      return SourceFileFilter.isIgnoredDirectoryExplicitlyIncluded(
        dirPath,
        srcPaths
      );
    }
    return true;
  }

  private static isIgnoredDirectoryExplicitlyIncluded(
    ignoredDirPath: string,
    srcPaths: Array<string>
  ): boolean {
    return srcPaths.some((srcPath) =>
      SourceFileFilter.isWithinPath(srcPath, ignoredDirPath)
    );
  }

  private static isWithinPath(targetPath: string, basePath: string): boolean {
    const relativePath = path.relative(basePath, targetPath);
    return relativePath === '' || !relativePath.startsWith('..');
  }
}
