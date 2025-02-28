import type {useNow as useNowType} from 'use-intl';
import getDefaultNow from '../server/react-server/getDefaultNow.js';
import useConfig from './useConfig.js';

export default function useNow(
  options?: Parameters<typeof useNowType>[0]
): ReturnType<typeof useNowType> {
  if (options?.updateInterval != null) {
    console.error(
      "`useNow` doesn't support the `updateInterval` option in Server Components, the value will be ignored. If you need the value to update, you can convert the component to a Client Component."
    );
  }

  const config = useConfig('useNow');
  return config.now ?? getDefaultNow();
}
