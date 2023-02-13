import getTimeZone from '../server/getTimeZone';
import useHook from './useHook';

export default function useTimeZone() {
  return useHook('useTimeZone', getTimeZone());
}
