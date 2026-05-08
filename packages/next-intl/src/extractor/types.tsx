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
  /**
   * All unique descriptions attached to messages (e.g. multiple `#.` lines in PO).
   * Ordered by source reference (path, then line).
   */
  description: Array<string>;
  /**
   * Source locations for this message (e.g. `#:` lines in PO). Ordered by path, then line.
   * Empty when the catalog format does not store references or none are known.
   */
  references: Array<ExtractorMessageReference>;
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
    /**
     * Relative path(s) to your source code files.
     */
    srcPath: string | Array<string>;
  };
  messages: {
    /** The format of your messages files. */
    format: MessagesFormat;
    /**
     * @deprecated Use `extract.locales`. See https://github.com/amannn/next-intl/pull/2313.
     */
    locales?: 'infer' | ReadonlyArray<Locale>;
    /** Relative path(s) to your messages files. */
    path: string | Array<string>;
  };
  /**
   * @deprecated Use `extract.sourceLocale`. See https://github.com/amannn/next-intl/pull/2313.
   */
  sourceLocale?: string;
  /**
   * @deprecated Use `extract.srcPath`. See https://github.com/amannn/next-intl/pull/2313.
   */
  srcPath?: string | Array<string>;
};

/** Normalized config used internally after `normalizeExtractorConfig`. */
export type ExtractorConfig = {
  extract: {
    locales: 'infer' | ReadonlyArray<Locale>;
    path: string;
    sourceLocale: string;
    srcPath: string | Array<string>;
  };
  messages: {
    format: MessagesFormat;
    path: Array<string>;
  };
};

export type CatalogLoaderConfig = {
  messages: {
    format: MessagesFormat;
    precompile?: boolean;
  };
};
