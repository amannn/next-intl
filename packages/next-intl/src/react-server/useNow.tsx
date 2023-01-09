import useRuntimeConfig from './useRuntimeConfig';

export default function useNow() {
  return useRuntimeConfig().now;
}
