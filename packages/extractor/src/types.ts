import type {
  ExtractorMessageReference,
  Locale,
  MessagesFormat,
  MessagesPathEntry
} from '@eloqnt/messages/_internal';

/** A single statically extracted source-code usage before any aggregation. */
export type SourceExtractedMessage = {
  id: string;
  message: string;
  description: string | null;
  reference: ExtractorMessageReference;
};

/** Normalized config used internally after `normalizeExtractorConfig`. */
export type ExtractorConfig = {
  extract: {
    locales: 'infer' | ReadonlyArray<Locale>;
    path: MessagesPathEntry;
    sourceLocale: string;
    srcPath: string | Array<string>;
    mdx?: boolean;
  };
  messages: {
    format: MessagesFormat;
    path: Array<string>;
    /** Maps locales to the codes used for `{code}` in `extract.path`. */
    codes?: Record<Locale, string>;
  };
};
