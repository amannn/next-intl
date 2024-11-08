import {ReactNode} from 'react';

// These type names are shown to consumers in autocomplete
export type ICUArg = string | number | boolean | Date;
export type ICUNumber = number;
export type ICUDate = Date | number | string;

type TranslationValues = Record<string, ICUArg>;

export type RichChunksFunction = (chunks: ReactNode) => ReactNode;
export type MarkupChunksFunction = (chunks: string) => string;

// We could consider renaming this to `ReactRichTranslationValues` and defining
// it in the `react` namespace if the core becomes useful to other frameworks.
// It would be a breaking change though, so let's wait for now.
export type RichTranslationValues = Record<string, ICUArg | RichChunksFunction>;

export type MarkupTranslationValues = Record<
  string,
  ICUArg | MarkupChunksFunction
>;

export default TranslationValues;
