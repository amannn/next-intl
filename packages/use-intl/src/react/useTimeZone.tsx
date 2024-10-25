import useIntlContext from './useIntlContext.tsx';

export default function useTimeZone() {
  return useIntlContext().timeZone;
}
