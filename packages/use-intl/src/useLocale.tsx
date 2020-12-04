import useIntlContext from './useIntlContext';

export default function useLocale() {
  const context = useIntlContext();
  return context.locale;
}
