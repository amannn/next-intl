import type {useTimeZone as useTimeZoneType} from 'use-intl';
import useConfig from './useConfig.tsx';

export default function useTimeZone(): ReturnType<typeof useTimeZoneType> {
  const config = useConfig('useTimeZone');
  return config.timeZone;
}
