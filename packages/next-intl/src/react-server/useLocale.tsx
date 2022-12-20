import useConfig from './useConfig';

export default function useLocale() {
  return useConfig().locale;
}
