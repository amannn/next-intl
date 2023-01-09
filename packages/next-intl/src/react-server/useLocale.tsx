import useRuntimeConfig from './useRuntimeConfig';

export default function useLocale() {
  return useRuntimeConfig().locale;
}
