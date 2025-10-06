import type formatters from './formatters/index.js';

// Is likely the same as the `Locale` type in `use-intl`,
// but users may map messages to runtime locales, therefore
// don't require a match here.
export type Locale = string;

export type ExtractedMessage = {
  id: string;
  message: string;
  description?: string;
  filePath?: string;
  line?: number;
  column?: number;
};

export type ExtractorConfig = {
  sourceLocale: string;
  messagesPath: string;
  srcPath: string | Array<string>;
  formatter: keyof typeof formatters;
  // TODO: Should we let user configure extensions here? A glob?
};
