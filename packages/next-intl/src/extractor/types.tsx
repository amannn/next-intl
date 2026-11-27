import type {ExtractorConfig as SharedExtractorConfig} from '@eloqnt/extractor/_internal';
import type {Locale, MessagesFormat} from '@eloqnt/messages/_internal';

// next-intl writes to a single folder
export type ExtractorConfig = SharedExtractorConfig & {extract: {path: string}};

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
        /** Extract messages from local MDX files using `next-intl/extractor/mdx`. */
        mdx?: boolean;
        /** @deprecated Prefer `messages.sourceLocale`. */
        sourceLocale?: string;
      };
};

export type CatalogLoaderConfig = {
  messages: {
    format: MessagesFormat;
    precompile?: boolean;
    sourceLocale: Locale;
  };
};
