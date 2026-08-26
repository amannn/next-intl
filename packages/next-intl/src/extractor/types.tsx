import type {Message, MessageReference} from '@eloqnt/config';
import type {MessagesFormat} from './format/types.js';

// Is likely the same as the `Locale` type in `use-intl`,
// but users may map messages to runtime locales, therefore
// don't require a match here.
export type Locale = string;

export type ExtractorMessageReference = MessageReference;

/** A single statically extracted source-code usage before any aggregation. */
export type SourceExtractedMessage = {
  id: string;
  message: string;
  description: string | null;
  reference: ExtractorMessageReference;
};

/** An aggregated message that can be read from or written to a catalog. */
export type ExtractorMessage = Message;

/**
 * External extractor configuration (Next.js plugin, `extractMessages`).
 */
export type ExtractorConfigInput = {
  /**
   * Relative path(s) to your source code files.
   */
  srcPath?: string | Array<string>;
  messages: {
    /** The format of your messages files. */
    format: MessagesFormat;
    /** Relative path(s) to your messages files. */
    path: string | Array<string>;
    /**
     * Locales kept in sync with [`messages.sourceLocale`](https://next-intl.dev/docs/usage/plugin#messages-source-locale).
     */
    locales: 'infer' | ReadonlyArray<Locale>;
    /** Locale to which extracted source strings are written. */
    sourceLocale?: string;
  };
  /**
   * Enables the usage of `useExtracted`.
   */
  extract?:
    | true
    | {
        /** Defaults to `messages.path` when it is a single path. */
        path?: string;
        /** @deprecated Prefer `messages.sourceLocale`. */
        sourceLocale?: string;
      };
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
    sourceLocale: Locale;
  };
};
