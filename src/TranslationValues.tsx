import {ReactNode} from 'react';

type TranslationValues = Record<
  string,
  // From IntlMessageFormat#format
  string | number | boolean | Date | null | undefined | ReactNode
>;

export default TranslationValues;
