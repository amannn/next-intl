import path from 'path';

export default class SourceFileFilter {
  static readonly EXTENSIONS = ['ts', 'tsx', 'js', 'jsx'];

  static isSourceFile(filePath: string) {
    const ext = path.extname(filePath);
    return SourceFileFilter.EXTENSIONS.map((cur) => '.' + cur).includes(ext);
  }
}
