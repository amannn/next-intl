import type {ReactNode} from 'react';

export type TranslationValues = Record<
  string,
  // All params that are allowed for basic params as well as operators like
  // `plural`, `select`, `number` and `date`. Note that `Date` is not supported
  // for plain params, but this requires type information from the ICU parser.
  string | number | Date
>;

export type RichTagsFunction = (chunks: ReactNode) => ReactNode;
export type MarkupTagsFunction = (chunks: string) => string;

// We could consider renaming this to `ReactRichTranslationValues` and defining
// it in the `react` namespace if the core becomes useful to other frameworks.
// It would be a breaking change though, so let's wait for now.
export type RichTranslationValues = Record<
  string,
  TranslationValues[string] | RichTagsFunction
>;

export type MarkupTranslationValues = Record<
  string,
  TranslationValues[string] | MarkupTagsFunction
>;
