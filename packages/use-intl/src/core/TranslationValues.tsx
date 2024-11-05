import {ReactNode} from 'react';

export type PlainTranslationValue = string | number | boolean | Date;

export type NumberTranslationValue = number;
export type DateTranslationValue = Date | number | string;

type TranslationValues = Record<string, PlainTranslationValue>;

export type RichTextFunction = (chunks: ReactNode) => ReactNode;
export type MarkupFunction = (chunks: string) => string;

// We could consider renaming this to `ReactRichTranslationValues` and defining
// it in the `react` namespace if the core becomes useful to other frameworks.
// It would be a breaking change though, so let's wait for now.
export type RichTranslationValues = Record<
  string,
  PlainTranslationValue | RichTextFunction
>;

export type MarkupTranslationValues = Record<
  string,
  PlainTranslationValue | MarkupFunction
>;

export default TranslationValues;
