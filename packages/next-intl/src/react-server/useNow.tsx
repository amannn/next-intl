import type {useNow as useNowType} from 'use-intl';
import getNow from '../server/getNow';
import useHook from './useHook';

export default function useNow(
  ...[options]: Parameters<typeof useNowType>
): ReturnType<typeof useNowType> {
  if (options?.updateInterval != null) {
    console.error(
      "`useNow` doesn't support the `updateInterval` option in Server Components, the value will be ignored. If you need the value to update, you can convert the component to a Client Component."
    );
  }

  return useHook('useNow', getNow());
}
