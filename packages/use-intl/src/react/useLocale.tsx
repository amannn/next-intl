import type {Locale} from '../core.js';
import useIntlContext from './useIntlContext.js';

export default function useLocale(): Locale {
  return useIntlContext().locale;
}
