import type {MessagesFormat} from './format/types.js';

// Is likely the same as the `Locale` type in `use-intl`,
// but users may map messages to runtime locales, therefore
// don't require a match here.
export type Locale = string;

export type ExtractorMessageReference = {
  path: string;
  line?: number;
};

/** A single statically extracted source-code usage before any aggregation. */
export type SourceMessage = {
  id: string;
  message: string;
  description: string | null;
  reference: ExtractorMessageReference;
};

/** An aggregated message that can be read from or written to a catalog. */
export type ExtractorMessage = {
  id: string;
  message: string;
  description?: string | Array<string>;
  references?: Array<ExtractorMessageReference>;
  /** Allows for additional properties like .po flags to be read and later written. */
  [key: string]: unknown;
};

export type MessagesConfig = {
  path: string;
  format: MessagesFormat;
  locales: 'infer' | ReadonlyArray<Locale>;
  precompile?: boolean;
};

export type ExtractorConfig = {
  srcPath: string | Array<string>;
  sourceLocale: string;
  messages: MessagesConfig;
};

export type CatalogLoaderConfig = {
  messages: MessagesConfig;
};
