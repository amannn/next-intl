import {ReactNode} from 'react';

// From IntlMessageFormat#format
type TranslationValue = string | number | boolean | Date | null | undefined;

type TranslationValues = Record<string, TranslationValue>;

export type RichTranslationValues = Record<
  string,
  TranslationValue | ((children: ReactNode) => ReactNode)
>;

export default TranslationValues;
