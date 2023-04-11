import {useMemo} from 'react';
import createIntl from '../core/createIntl';
import useIntlContext from './useIntlContext';

let hasWarned = false;

/** @deprecated Switch to `useFormatter` instead. */
export default function useIntl() {
  const {formats, locale, now: globalNow, onError, timeZone} = useIntlContext();

  if (!hasWarned) {
    hasWarned = true;
    console.warn(
      '`useIntl()` is deprecated and will be removed in the next major version. Please switch to `useFormatter()`.'
    );
  }

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
