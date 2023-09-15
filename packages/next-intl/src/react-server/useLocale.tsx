import type {useLocale as useLocaleType} from 'use-intl';
import {getRequestLocale} from '../server/RequestLocale';

export default function useLocale(
  // eslint-disable-next-line no-empty-pattern
  ...[]: Parameters<typeof useLocaleType>
): ReturnType<typeof useLocaleType> {
  return getRequestLocale();
}
