import useConfig from './useConfig';

export default function useNow() {
  return useConfig().now;
}
