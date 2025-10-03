import path from 'path';

export default class SourceFileAnalyzer {
  static readonly EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
  static readonly IGNORED_DIRECTORIES = ['node_modules'];

  static isSourceFile(filePath: string) {
    const ext = path.extname(filePath);
    return SourceFileAnalyzer.EXTENSIONS.includes(ext);
  }
}
