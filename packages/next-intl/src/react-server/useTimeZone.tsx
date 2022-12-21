import useConfig from './useConfig';

export default function useTimeZone() {
  return useConfig().timeZone;
}
