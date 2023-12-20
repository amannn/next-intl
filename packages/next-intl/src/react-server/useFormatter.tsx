import {cache} from 'react';
import {createFormatter, type useFormatter as useFormatterType} from 'use-intl';
import useConfig from './useConfig';

const createFormatterCached = cache(createFormatter);

export default function useFormatter(
  // eslint-disable-next-line no-empty-pattern
  ...[]: Parameters<typeof useFormatterType>
): ReturnType<typeof useFormatterType> {
  const config = useConfig('useFormatter');
  return createFormatterCached(config);
}
