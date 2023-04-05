import type {useFormatter as useFormatterType} from 'use-intl';
import getFormatter from '../server/getFormatter';
import useHook from './useHook';

export default function useFormatter(
  // eslint-disable-next-line no-empty-pattern
  ...[]: Parameters<typeof useFormatterType>
): ReturnType<typeof useFormatterType> {
  return useHook('useFormatter', getFormatter());
}
