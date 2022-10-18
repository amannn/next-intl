import {useMemo} from 'react';
import createIntl from '../core/createIntl';
import useIntlContext from './useIntlContext';

export default function useIntl() {
  const {formats, locale, now: globalNow, onError, timeZone} = useIntlContext();

  return useMemo(
    () =>
      createIntl({
        formats,
        locale,
        now: globalNow,
        onError,
        timeZone
      }),
    [formats, globalNow, locale, onError, timeZone]
  );
}
