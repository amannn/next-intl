import type {MessagesFormat} from './format/types.js';

// Is likely the same as the `Locale` type in `use-intl`,
// but users may map messages to runtime locales, therefore
// don't require a match here.
export type Locale = string;

export type ExtractorMessageReference = {
  path: string;
  line?: number;
};

export type ExtractorMessage = {
  id: string;
  message: string;
  description?: string;
  references?: Array<ExtractorMessageReference>;
  /** Allows for additional properties like .po flags to be read and later written. */
  [key: string]: unknown;
};

export type ExtractorMessagesConfig = {
  format: MessagesFormat;
};

export type CatalogFormatConfig = ExtractorMessagesConfig & {
  precompile?: boolean;
};

export type ExtractorConfig = {
  srcPath: string | Array<string>;
  sourceLocale: string;
  /** Writable root where extracted catalogs are read and written. */
  catalogPath: string;
  locales: 'infer' | ReadonlyArray<Locale>;
  messages: ExtractorMessagesConfig;
};

export type CatalogLoaderConfig = {
  messages: CatalogFormatConfig;
};
