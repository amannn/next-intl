import type {useTranslations as useTranslationsType} from 'use-intl';
import getTranslator from '../server/getTranslator';
import useHook from './useHook';
import useLocale from './useLocale';

export default function useTranslations(
  ...[namespace]: Parameters<typeof useTranslationsType>
): ReturnType<typeof useTranslationsType> {
  const locale = useLocale();
  const result = useHook('useTranslations', getTranslator(locale, namespace));

  // The types are slightly off here and indicate that rich text formatting
  // doesn't integrate with React - this is not the case.
  return result as any;
}
