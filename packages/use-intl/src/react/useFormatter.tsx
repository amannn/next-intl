import {useMemo} from 'react';
import createFormatter from '../core/createFormatter';
import useIntlContext from './useIntlContext';

export default function useFormatter() {
  const {formats, locale, now: globalNow, onError, timeZone} = useIntlContext();

  return useMemo(
    () =>
      createFormatter({
        formats,
        locale,
        now: globalNow,
        onError,
        timeZone
      }),
    [formats, globalNow, locale, onError, timeZone]
  );
}
