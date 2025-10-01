export type Locale = string;

export type ExtractedMessage = {
  id: string;
  message: string;
  description?: string;
  filePath?: string;
  line?: number;
  column?: number;
};
