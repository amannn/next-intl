import type {useTimeZone as useTimeZoneType} from 'use-intl';
import getTimeZone from '../server/getTimeZone';
import useHook from './useHook';
import useLocale from './useLocale';

export default function useTimeZone(
  // eslint-disable-next-line no-empty-pattern
  ...[]: Parameters<typeof useTimeZoneType>
): ReturnType<typeof useTimeZoneType> {
  const locale = useLocale();
  return useHook('useTimeZone', getTimeZone(locale));
}
