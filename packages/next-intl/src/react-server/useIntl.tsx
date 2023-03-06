import getIntl from '../server/getIntl';
import useHook from './useHook';

let hasWarned = false;

export default function useIntl() {
  if (!hasWarned) {
    hasWarned = true;
    console.warn(
      '`useIntl()` is deprecated and will be removed in the next major version. Please switch to `useFormatter()`.'
    );
  }

  return useHook('useIntl', getIntl());
}
