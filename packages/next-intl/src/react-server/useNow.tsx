import getNow from '../server/getNow';
import useHook from './useHook';

export default function useNow() {
  return useHook('useNow', getNow());
}
