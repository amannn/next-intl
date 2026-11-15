import type {
  ExtractorMessageReference,
  Locale,
  MessagesFormat
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
    path: string;
    sourceLocale: string;
    srcPath: string | Array<string>;
  };
  messages: {
    format: MessagesFormat;
    path: Array<string>;
  };
};
