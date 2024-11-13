import type {useTranslations as useTranslationsType} from 'use-intl';
import getTranslator from '../server/react-server/getTranslator.tsx';
import useConfig from './useConfig.tsx';

export default function useTranslations(
  ...[namespace]: Parameters<typeof useTranslationsType>
): ReturnType<typeof useTranslationsType> {
  const config = useConfig('useTranslations');
  return getTranslator(config, namespace);
}
