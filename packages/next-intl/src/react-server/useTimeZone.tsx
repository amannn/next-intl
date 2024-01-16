import type {useTimeZone as useTimeZoneType} from 'use-intl';
import useConfig from './useConfig';

export default function useTimeZone(
  // eslint-disable-next-line no-empty-pattern
  ...[]: Parameters<typeof useTimeZoneType>
): ReturnType<typeof useTimeZoneType> {
  const config = useConfig('useTimeZone');
  return config.timeZone;
}
