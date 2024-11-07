import {
  type Formats as IntlFormats,
  IntlMessageFormat
} from 'intl-messageformat';
import Formats from './Formats.tsx';
import TimeZone from './TimeZone.tsx';

/**
 * `intl-messageformat` uses separate keys for `date` and `time`, but there's
 * only one native API: `Intl.DateTimeFormat`. Additionally you might want to
 * include both a time and a date in a value, therefore the separation doesn't
 * seem so useful. We offer a single `dateTime` namespace instead, but we have
 * to convert the format before `intl-messageformat` can be used.
 */
export default function convertFormatsToIntlMessageFormat(
  globalFormats?: Formats,
  inlineFormats?: Formats,
  timeZone?: TimeZone
): Partial<IntlFormats> {
  const mfDateDefaults = IntlMessageFormat.formats.date as NonNullable<
    Formats['dateTime']
  >;
  const mfTimeDefaults = IntlMessageFormat.formats.time as NonNullable<
    Formats['dateTime']
  >;

  const dateTimeFormats = {
    ...globalFormats?.dateTime,
    ...inlineFormats?.dateTime
  };

  const allFormats = {
    date: {
      ...mfDateDefaults,
      ...dateTimeFormats
    },
    time: {
      ...mfTimeDefaults,
      ...dateTimeFormats
    },
    number: {
      ...globalFormats?.number,
      ...inlineFormats?.number
    }
    // (list is not supported in ICU messages)
  };

  if (timeZone) {
    // The only way to set a time zone with `intl-messageformat` is to merge it into the formats
    // https://github.com/formatjs/formatjs/blob/8256c5271505cf2606e48e3c97ecdd16ede4f1b5/packages/intl/src/message.ts#L15
    ['date', 'time'].forEach((property) => {
      const formats = allFormats[property as keyof typeof allFormats];
      for (const [key, value] of Object.entries(formats)) {
        formats[key] = {
          timeZone,
          ...value
        };
      }
    });
  }

  return allFormats;
}
