import {Formats as IntlFormats} from 'intl-messageformat';
import Formats from './Formats';

/**
 * `intl-messageformat` uses separate keys for `date` and `time`, but there's
 * only one native API: `Intl.DateTimeFormat`. Additionally you might want to
 * include both a time and a date in a value, therefore the separation doesn't
 * seem so useful. We offer a single `dateTime` namespace instead, but we have
 * to convert the format before `intl-messageformat` can be used.
 */
export default function convertFormatsToIntlMessageFormat(
  formats: Partial<Formats>
): Partial<IntlFormats> {
  return {
    ...formats,
    date: formats?.dateTime,
    time: formats?.dateTime
  };
}
