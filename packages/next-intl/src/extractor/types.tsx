import type {MessagesFormat} from './codecs/index.js';

// Is likely the same as the `Locale` type in `use-intl`,
// but users may map messages to runtime locales, therefore
// don't require a match here.
export type Locale = string;

export type ExtractedMessage = {
  id: string;
  message: string;
  description?: string;
  references?: Array<{path: string}>;
  /** Allows for additional properties like .po flags to be read and later written. */
  [key: string]: unknown;
};

export type MessagesConfig = {
  path: string;
  format: MessagesFormat;
  locales: 'infer' | ReadonlyArray<Locale>;
};

export type {MessagesFormat};

export type ExtractorConfig = {
  srcPath: string | Array<string>;
  sourceLocale: string;
  messages: MessagesConfig;
};

export type CatalogLoaderConfig = {
  messages: MessagesConfig;
};
