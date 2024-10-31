import {Locale} from '../core.tsx';
import useIntlContext from './useIntlContext.tsx';

export default function useLocale(): Locale {
  return useIntlContext().locale;
}
