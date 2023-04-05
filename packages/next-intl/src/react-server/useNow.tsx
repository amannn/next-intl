import type {useNow as useNowType} from 'use-intl';
import getNow from '../server/getNow';
import useHook from './useHook';

export default function useNow(
  ...[options]: Parameters<typeof useNowType>
): ReturnType<typeof useNowType> {
  if (options?.updateInterval) {
    console.error(
      '`updateInterval` is not supported in Server Components, the value will be ignored.'
    );
  }

  return useHook('useNow', getNow());
}
