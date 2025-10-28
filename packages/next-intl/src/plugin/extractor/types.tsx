import type formatters from './formatters/index.js';

// Is likely the same as the `Locale` type in `use-intl`,
// but users may map messages to runtime locales, therefore
// don't require a match here.
export type Locale = string;

export type ExtractedMessage = {
  id: string;
  message: string;
  description?: string;
  references?: Array<{path: string; line?: number}>;
};

export type ExtractorConfig = {
  srcPath: string | Array<string>;
  sourceLocale: string;
  messages: {
    path: string;
    format: keyof typeof formatters;
  };
};
