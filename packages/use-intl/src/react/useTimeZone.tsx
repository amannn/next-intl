import useIntlContext from './useIntlContext';

export default function useTimeZone() {
  return useIntlContext().timeZone;
}
