import type {useTranslations as useTranslationsType} from 'use-intl';
import {getTranslator} from '../runtimes/react-server';
import useConfig from './useConfig';

export default function useTranslations(
  ...[namespace]: Parameters<typeof useTranslationsType>
): ReturnType<typeof useTranslationsType> {
  const config = useConfig('useTranslations');
  return getTranslator(config, namespace);
}
