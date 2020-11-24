import {useRouter} from 'next/router';
import useIntlContext from './useIntlContext';

export default function useLocale() {
  const context = useIntlContext();
  const nextLocale = useRouter().locale;
  return context.locale || nextLocale;
}
