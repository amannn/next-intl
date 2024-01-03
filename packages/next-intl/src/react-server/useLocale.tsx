// @ts-ignore -- Only available after build
import {_getRequestLocale as getRequestLocale} from 'next-intl/server';
import type {useLocale as useLocaleType} from 'use-intl';

export default function useLocale(
  // eslint-disable-next-line no-empty-pattern
  ...[]: Parameters<typeof useLocaleType>
): ReturnType<typeof useLocaleType> {
  return getRequestLocale();
}
