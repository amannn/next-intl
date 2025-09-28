import {promises as fs} from 'fs';
import MessageExtractor from './extractor/MessageExtractor.ts';
import SourceFileScanner from './source/SourceFileScanner.ts';
import type {ExtractedMessage} from './types.ts';
import type Formatter from './formatters/Formatter.ts';

export class CatalogManager {
  private formatter: Formatter;
  private messagesByFile: Map<string, Array<ExtractedMessage>> = new Map();
  private srcPath: string;
  private extractor: MessageExtractor;

  constructor(formatter: Formatter, srcPath: string) {
    this.formatter = formatter;
    this.srcPath = srcPath;
    this.extractor = new MessageExtractor();
    this.messagesByFile = new Map();
  }

  async initFromSource() {
    const sourceFiles = await SourceFileScanner.getSourceFiles(this.srcPath);

    await Promise.all(
      sourceFiles.map(async (filePath) => this.extractFileMessages(filePath))
    );
  }

  async extractFileMessages(absoluteFilePath: string): Promise<number> {
    const content = await fs.readFile(absoluteFilePath, 'utf8');
    const messages = await this.extractor.extractFromFileContent(content);

    // If messages were removed from a file, we need to clean them up
    const hadMessages = this.messagesByFile.has(absoluteFilePath);
    const hasMessages = messages.length > 0;

    if (hasMessages || hadMessages) {
      if (hasMessages) {
        this.messagesByFile.set(absoluteFilePath, messages);
      } else {
        this.messagesByFile.delete(absoluteFilePath);
      }
    }

    return messages.length;
  }

  async save(): Promise<number> {
    // Sort and group by file paths
    // TODO: Is this always wanted?
    const messages = Array.from(this.messagesByFile.keys())
      .sort()
      .map((filePath) => this.messagesByFile.get(filePath) || [])
      .flat();
    await this.formatter.write(messages);
    return messages.length;
  }
}
