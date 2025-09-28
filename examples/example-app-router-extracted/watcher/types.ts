export type ExtractedMessage = {
  id: string;
  message: string;
  description?: string;
  namespace?: string;
  filePath?: string;
  line?: number;
  column?: number;
};

export type ExtractionConfig = {
  sourceLocale: string;
  messagesPath: string;
  srcPath: string;
};

export type FileChangeEvent = {
  type: 'change' | 'rename';
  filename: string;
  timestamp: string;
};
