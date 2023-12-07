import Formats from './Formats';

// Copied from intl-messageformat
const defaults = {
  number: {
    integer: {maximumFractionDigits: 0},
    currency: {style: 'currency'},
    percent: {style: 'percent'}
  },
  date: {
    short: {month: 'numeric', day: 'numeric', year: '2-digit'},
    medium: {month: 'short', day: 'numeric', year: 'numeric'},
    long: {month: 'long', day: 'numeric', year: 'numeric'},
    full: {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'}
  },
  time: {
    short: {hour: 'numeric', minute: 'numeric'},
    medium: {hour: 'numeric', minute: 'numeric', second: 'numeric'},
    long: {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short'
    },
    full: {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short'
    }
  }
} as const;

export default function getFormatters(
  timeZone?: string,
  formats?: Partial<Formats>,
  globalFormats?: Partial<Formats>
) {
  const formatters = {
    date(
      value: number | string,
      locale: string,
      formatName?: keyof typeof defaults.date
    ) {
      const allFormats = {
        ...defaults.date,
        // TODO: time & date vs dateTime. Maybe we should separate
        // time and date, because ICU does this too?
        ...globalFormats?.dateTime
      };

      const options: Intl.DateTimeFormatOptions = {timeZone};
      if (formatName && formatName in allFormats) {
        Object.assign(options, allFormats[formatName]);
      }

      // TODO: Use Intl.DateTimeFormat and caching?
      return new Date(value).toLocaleDateString(locale, options);
    },

    time(
      value: number | string,
      locale: string,
      formatName?: keyof typeof defaults.time
    ) {
      const allFormats = {
        ...defaults.time,
        ...globalFormats?.dateTime
      };

      const options: Intl.DateTimeFormatOptions = {timeZone};
      if (formatName && formatName in allFormats) {
        Object.assign(options, allFormats[formatName]);
      }

      // TODO: Use Intl.DateTimeFormat and caching?
      return new Date(value).toLocaleTimeString(locale, options);
    },

    numberFmt(value: number, locale: string, arg: string) {
      const allFormats = {
        ...defaults.number,
        ...globalFormats?.number,
        ...formats?.number
      };

      // Based on https://github.com/messageformat/messageformat/blob/main/packages/runtime/src/fmt/number.ts
      const [formatName, currency] = (arg && arg.split(':')) || [];

      const options: Intl.NumberFormatOptions = {currency};
      if (formatName && formatName in allFormats) {
        Object.assign(options, (allFormats as any)[formatName]);
      }

      // TODO: Caching?
      const format = new Intl.NumberFormat(locale, options);
      return format.format(value);
    }
  };

  return formatters;
}
