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

export type ExtractorConfigInput = {
  srcPath: string | Array<string>;
  /**
   * @deprecated Use `extract.sourceLocale`
   */
  sourceLocale?: string;
  messages: {
    path: string | Array<string>;
    format: MessagesFormat;
    /** @deprecated Use `extract.locales` instead. */
    locales?: 'infer' | ReadonlyArray<Locale>;
  };
  extract?: {
    sourceLocale?: string;
    path?: string;
    locales?: 'infer' | ReadonlyArray<Locale>;
  };
};

export type ExtractorConfig = {
  extract: {
    locales: 'infer' | ReadonlyArray<Locale>;
    path: string;
    sourceLocale: string;
  };
  messages: {
    format: MessagesFormat;
    path: string | Array<string>;
  };
  srcPath: ExtractorConfigInput['srcPath'];
};

export type CatalogLoaderConfig = {
  messages: CatalogFormatConfig;
};
