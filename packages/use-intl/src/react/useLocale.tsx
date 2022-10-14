import useIntlContext from './useIntlContext';

export default function useLocale() {
  return useIntlContext().locale;
}
