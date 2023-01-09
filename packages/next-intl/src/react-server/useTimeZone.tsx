import useRuntimeConfig from './useRuntimeConfig';

export default function useTimeZone() {
  return useRuntimeConfig().timeZone;
}
