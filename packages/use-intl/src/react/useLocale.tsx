import useIntlContext from './useIntlContext.tsx';

export default function useLocale() {
  return useIntlContext().locale;
}
