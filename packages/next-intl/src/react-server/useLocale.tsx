import type {useLocale as useLocaleType} from 'use-intl';
import getLocaleFromHeader from '../server/getLocaleFromHeader';

export default function useLocale(
  // eslint-disable-next-line no-empty-pattern
  ...[]: Parameters<typeof useLocaleType>
): ReturnType<typeof useLocaleType> {
  return getLocaleFromHeader();
}
