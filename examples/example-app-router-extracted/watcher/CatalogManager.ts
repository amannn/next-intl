import {MessageExtractor} from './MessageExtractor.ts';
import SourceFileScanner from './SourceFileScanner.ts';
import type {ExtractedMessage, MessageFormatter} from './types.ts';

export class CatalogManager {
  private formatter: MessageFormatter;
  private messagesByFile: Map<string, Array<ExtractedMessage>> = new Map();
  private srcPath: string;
  private extractor: MessageExtractor;

  constructor(formatter: MessageFormatter, srcPath: string) {
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
    // TODO: If a known message id is encountered, check
    // if it's still used in the previous location
    const messages = await this.extractor.extractFromFile(absoluteFilePath);
    this.messagesByFile.set(absoluteFilePath, messages);
    return messages.length;
  }

  async save(): Promise<number> {
    // Sort and group by file paths
    const messages = Array.from(this.messagesByFile.keys())
      .sort()
      .map((filePath) => this.messagesByFile.get(filePath) || [])
      .flat();
    await this.formatter.write(messages);
    return messages.length;
  }
}
