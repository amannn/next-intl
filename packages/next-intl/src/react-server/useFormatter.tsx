import getFormatter from '../server/getFormatter';
import useHook from './useHook';

export default function useFormatter() {
  return useHook('useFormatter', getFormatter());
}
