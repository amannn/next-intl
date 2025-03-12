import useIntlContext from './useIntlContext.js';

export default function useTimeZone() {
  return useIntlContext().timeZone;
}
