import type {useFormatter as useFormatterType} from 'use-intl';
import getFormatter from '../server/getFormatter';
import useHook from './useHook';
import useLocale from './useLocale';

export default function useFormatter(
  // eslint-disable-next-line no-empty-pattern
  ...[]: Parameters<typeof useFormatterType>
): ReturnType<typeof useFormatterType> {
  const locale = useLocale();
  return useHook('useFormatter', getFormatter(locale));
}
