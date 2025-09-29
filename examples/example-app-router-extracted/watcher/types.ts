export type MessageId = string;

export type Locale = string;

export type ExtractedMessage = {
  id: MessageId;
  message: string;
  description?: string;
  filePath?: string;
  line?: number;
  column?: number;
};
