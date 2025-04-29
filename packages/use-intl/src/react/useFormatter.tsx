import {useMemo} from 'react';
import createFormatter from '../core/createFormatter.js';
import useIntlContext from './useIntlContext.js';

export default function useFormatter(): ReturnType<typeof createFormatter> {
  const {
    formats,
    formatters,
    locale,
    now: globalNow,
    onError,
    timeZone
  } = useIntlContext();

  return useMemo(
    () =>
      createFormatter({
        formats,
        locale,
        now: globalNow,
        onError,
        timeZone,
        _formatters: formatters
      }),
    [formats, formatters, globalNow, locale, onError, timeZone]
  );
}
