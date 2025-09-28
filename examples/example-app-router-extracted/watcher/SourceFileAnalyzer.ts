import path from 'path';

export default class SourceFileAnalyzer {
  private static readonly EXTENSIONS = [
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '.mjs',
    '.cjs',
    '.mts',
    '.cts'
  ];

  static isSourceFile(filePath: string) {
    const ext = path.extname(filePath);
    return SourceFileAnalyzer.EXTENSIONS.includes(ext);
  }
}
