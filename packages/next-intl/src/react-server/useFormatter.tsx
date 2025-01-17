import type {useFormatter as useFormatterType} from 'use-intl';
import getServerFormatter from '../server/react-server/getServerFormatter.js';
import useConfig from './useConfig.js';

export default function useFormatter(): ReturnType<typeof useFormatterType> {
  const config = useConfig('useFormatter');
  return getServerFormatter(config);
}
