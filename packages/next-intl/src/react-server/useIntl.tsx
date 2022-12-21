import {createIntl} from 'use-intl/dist/src/core';
import useConfig from './useConfig';

export default function useIntl() {
  const config = useConfig();

  // TODO: Could be cached
  return createIntl(config);
}
