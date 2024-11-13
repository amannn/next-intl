import {cache} from 'react';
import type {useFormatter as useFormatterType} from 'use-intl';
import {createFormatter} from 'use-intl/core';
import getDefaultNow from '../server/react-server/getDefaultNow.tsx';
import useConfig from './useConfig.tsx';

const createFormatterCached = cache(createFormatter);

export default function useFormatter(): ReturnType<typeof useFormatterType> {
  const config = useConfig('useFormatter');

  return createFormatterCached({
    ...config,
    // Only init when necessary to avoid triggering a `dynamicIO` error
    // unnecessarily (`now` is only needed for `format.relativeTime`)
    get now() {
      return config.now ?? getDefaultNow();
    }
  });
}
