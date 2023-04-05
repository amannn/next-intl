import type {useLocale as useLocaleType} from 'use-intl';
import getLocale from '../server/getLocale';

export default function useLocale(
  // eslint-disable-next-line no-empty-pattern
  ...[]: Parameters<typeof useLocaleType>
): ReturnType<typeof useLocaleType> {
  return getLocale();
}
