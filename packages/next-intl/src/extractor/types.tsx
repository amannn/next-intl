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

/**
 * External extractor configuration (Next.js plugin, `extractMessages`).
 */
export type ExtractorConfigInput = {
  extract?: {
    /**
     * Locales kept in sync with [`extract.sourceLocale`](https://next-intl.dev/docs/usage/plugin#extract).
     */
    locales: 'infer' | ReadonlyArray<Locale>;
    /**
     * Writable catalog directory when extracting. Required if `messages.path` is an array.
     * Defaults to `messages.path` when it is a single path.
     */
    path?: string;
    /** Locale to which extracted source strings are written. */
    sourceLocale: string;
  };
  messages: {
    /** The format of your messages files. */
    format: MessagesFormat;
    /**
     * @deprecated Use `extract.locales`.
     */
    locales?: 'infer' | ReadonlyArray<Locale>;
    /** Relative path(s) to your messages files. */
    path: string | Array<string>;
  };
  /**
   * @deprecated Use `extract.sourceLocale`.
   */
  sourceLocale?: string;
  /**
   * Relative path(s) to your source files, to be used in combination with `extract` and `messages`.
   */
  srcPath: string | Array<string>;
};

/** Normalized config used internally after `normalizeExtractorConfig`. */
export type ExtractorConfig = {
  extract: {
    locales: 'infer' | ReadonlyArray<Locale>;
    path: string;
    sourceLocale: string;
  };
  messages: {
    format: MessagesFormat;
    path: Array<string>;
  };
  srcPath: string | Array<string>;
};

export type CatalogLoaderConfig = {
  messages: {
    format: MessagesFormat;
    precompile?: boolean;
  };
};
