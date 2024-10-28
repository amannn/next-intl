import type {useLocale as useLocaleType} from 'use-intl';
import useConfig from './useConfig.tsx';

export default function useLocale(): ReturnType<typeof useLocaleType> {
  const config = useConfig('useLocale');
  return config.locale;
}
