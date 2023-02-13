import getTranslations from '../server/getTranslations';
import useHook from './useHook';

export default function useTranslations(namespace?: string) {
  return useHook('useTranslations', getTranslations(namespace));
}
