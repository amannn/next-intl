import type {useTranslations as useTranslationsType} from 'use-intl';
import getServerTranslator from '../server/react-server/getServerTranslator.tsx';
import useConfig from './useConfig.tsx';

export default function useTranslations(
  ...[namespace]: Parameters<typeof useTranslationsType>
): ReturnType<typeof useTranslationsType> {
  const config = useConfig('useTranslations');
  return getServerTranslator(config, namespace);
}
