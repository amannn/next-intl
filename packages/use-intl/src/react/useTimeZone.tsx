import { TimeZone } from '../core/utils/TimeZones';
import useIntlContext from './useIntlContext';

export default function useTimeZone(): TimeZone {
  return useIntlContext().timeZone;
}
