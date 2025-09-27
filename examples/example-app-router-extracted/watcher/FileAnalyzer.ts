import {promises as fs} from 'fs';
import path from 'path';
import type {ExtractedMessage} from './types.ts';
import {MessageExtractor} from './MessageExtractor.ts';

export default class FileAnalyzer {
  static readonly EXTENSIONS: Array<string> = [
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '.mjs',
    '.cjs',
    '.mts',
    '.cts'
  ];

  static async walkSourceFiles(
    dir: string,
    acc: Array<string> = []
  ): Promise<Array<string>> {
    const entries = await fs.readdir(dir, {withFileTypes: true});
    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entryPath.includes('node_modules')) continue;
        await FileAnalyzer.walkSourceFiles(entryPath, acc);
      } else {
        const ext = path.extname(entry.name);
        if (FileAnalyzer.EXTENSIONS.includes(ext)) {
          acc.push(entryPath);
        }
      }
    }
    return acc;
  }

  static async loadMessages(
    srcPath: string,
    extractor: MessageExtractor
  ): Promise<Array<ExtractedMessage>> {
    const files = await FileAnalyzer.walkSourceFiles(srcPath);
    const results = await Promise.all(
      files.map((f) => extractor.extractFromFile(f))
    );
    return results.flat();
  }
}
