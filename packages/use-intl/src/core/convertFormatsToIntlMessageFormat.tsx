import {Formats as IntlFormats} from 'intl-messageformat';
import DateTimeFormatOptions from './DateTimeFormatOptions';
import Formats from './Formats';
import TimeZone from './TimeZone';

function setTimeZoneInFormats(
  formats: Record<string, DateTimeFormatOptions> | undefined,
  timeZone: TimeZone
) {
  if (!formats) return formats;

  // The only way to set a time zone with `intl-messageformat` is to merge it into the formats
  // https://github.com/formatjs/formatjs/blob/8256c5271505cf2606e48e3c97ecdd16ede4f1b5/packages/intl/src/message.ts#L15
  return Object.keys(formats).reduce(
    (acc: Record<string, DateTimeFormatOptions>, key) => {
      acc[key] = {
        timeZone,
        ...formats[key]
      };
      return acc;
    },
    {}
  );
}

/**
 * `intl-messageformat` uses separate keys for `date` and `time`, but there's
 * only one native API: `Intl.DateTimeFormat`. Additionally you might want to
 * include both a time and a date in a value, therefore the separation doesn't
 * seem so useful. We offer a single `dateTime` namespace instead, but we have
 * to convert the format before `intl-messageformat` can be used.
 */
export default function convertFormatsToIntlMessageFormat(
  formats: Partial<Formats>,
  timeZone?: TimeZone
): Partial<IntlFormats> {
  const formatsWithTimeZone = timeZone
    ? {...formats, dateTime: setTimeZoneInFormats(formats.dateTime, timeZone)}
    : formats;

  return {
    ...formatsWithTimeZone,
    date: formatsWithTimeZone?.dateTime,
    time: formatsWithTimeZone?.dateTime
  };
}
