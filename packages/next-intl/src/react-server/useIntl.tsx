import {useMemo} from 'react';
import {createIntl} from 'use-intl/dist/src/core';
import useConfig from './useConfig';

export default function useIntl() {
  const config = useConfig();

  return useMemo(() => createIntl(config), [config]);
}
