import {ReactNode} from 'react';

// From IntlMessageFormat#format
export type TranslationValue =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined;

type TranslationValues = Record<string, TranslationValue>;

export type RichTranslationValues = Record<
  string,
  TranslationValue | ((chunks: ReactNode) => ReactNode)
>;

export default TranslationValues;
