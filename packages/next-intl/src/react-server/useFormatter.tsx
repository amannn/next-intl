import {cache} from 'react';
import type {useFormatter as useFormatterType} from 'use-intl';
import {createFormatter} from 'use-intl/core';
import useConfig from './useConfig.tsx';

const createFormatterCached = cache(createFormatter);

export default function useFormatter(): ReturnType<typeof useFormatterType> {
  const config = useConfig('useFormatter');
  return createFormatterCached(config);
}
