import {ReactNode} from 'react';

// From IntlMessageFormat#format
export type PlainTranslationValue =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined;

type TranslationValues = Record<string, PlainTranslationValue>;

// We could consider renaming this to `ReactRichTranslationValues` and defining
// it in the `react` namespace if the core becomes useful to other frameworks.
// It would be a breaking change though, so let's wait for now.
export type RichTranslationValues = Record<
  string,
  PlainTranslationValue | ((chunks: ReactNode) => ReactNode)
>;

export type MarkupTranslationValues = Record<
  string,
  PlainTranslationValue | ((chunks: string) => string)
>;

export default TranslationValues;
