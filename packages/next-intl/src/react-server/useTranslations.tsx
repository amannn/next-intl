import type {useTranslations as useTranslationsType} from 'use-intl';
import getTranslations from '../server/getTranslations';
import useHook from './useHook';

export default function useTranslations(
  ...[namespace]: Parameters<typeof useTranslationsType>
): ReturnType<typeof useTranslationsType> {
  const result = useHook('useTranslations', getTranslations(namespace));

  // The types are slightly off here and indicate that rich text formatting
  // doesn't integrate with React - this is not the case.
  return result as any;
}
