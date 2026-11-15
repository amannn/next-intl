import type {defineCodec} from '@eloqnt/config';

// Is likely the same as the `Locale` type in `use-intl`,
// but users may map messages to runtime locales, therefore
// don't require a match here.
export type Locale = string;

type SharedSeparateFileCodec = Extract<
  ReturnType<ReturnType<typeof defineCodec>>,
  {decode: unknown}
>;

export type ExtractorMessageReference = ExtractorMessage['references'][number];

/** An aggregated message that can be read from or written to a catalog. */
export type ExtractorMessage = ReturnType<
  SharedSeparateFileCodec['decode']
>[number];
