export type ExtractedMessage = {
  id: string;
  message: string;
  description?: string;
  namespace?: string;
  filePath?: string;
  line?: number;
  column?: number;
};
