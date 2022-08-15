import {ReactNode} from 'react';

// From IntlMessageFormat#format
type TranslationValue = ReactNode | Date;

type TranslationValues = Record<string, TranslationValue>;

export type RichTranslationValues = Record<
  string,
  TranslationValue | ((children: ReactNode) => ReactNode)
>;

export default TranslationValues;
