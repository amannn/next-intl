import type {useTranslations as useTranslationsType} from 'use-intl';
import getConfig from '../server/react-server/getConfig';
import getBaseTranslator from './getTranslator';
import useHook from './useHook';
import useLocale from './useLocale';

export default function useTranslations(
  ...[namespace]: Parameters<typeof useTranslationsType>
): ReturnType<typeof useTranslationsType> {
  const locale = useLocale();
  const config = useHook('useTranslations', getConfig(locale));
  return getBaseTranslator(config, namespace);
}
