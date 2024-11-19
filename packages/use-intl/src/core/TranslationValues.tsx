import type {ReactNode} from 'react';

type ICUArg = string | number | boolean | Date;
// ^ Keep this in sync with `ICUArgument` in `createTranslator.tsx`

export type TranslationValues = Record<string, ICUArg>;

export type RichTagsFunction = (chunks: ReactNode) => ReactNode;
export type MarkupTagsFunction = (chunks: string) => string;

// We could consider renaming this to `ReactRichTranslationValues` and defining
// it in the `react` namespace if the core becomes useful to other frameworks.
// It would be a breaking change though, so let's wait for now.
export type RichTranslationValues = Record<string, ICUArg | RichTagsFunction>;

export type MarkupTranslationValues = Record<
  string,
  ICUArg | MarkupTagsFunction
>;
