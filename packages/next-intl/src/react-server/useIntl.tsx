import getIntl from '../server/getIntl';
import useHook from './useHook';

export default function useIntl() {
  return useHook('useIntl', getIntl());
}
