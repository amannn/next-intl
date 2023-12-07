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

type FormatNameOrArgs<Options> =
  | string
  | {
      type: number; // TODO: Unused, is this necessary?
      tokens: Array<unknown>; // TODO: Unused, is this necessary?
      parsedOptions?: Options;
    };

export default function getFormatters(
  timeZone?: string,
  formats?: Partial<Formats>,
  globalFormats?: Partial<Formats>
) {
  const formatters = {
    date(
      value: number | string,
      locale: string,
      formatNameOrArgs?: FormatNameOrArgs<Intl.DateTimeFormatOptions>
    ) {
      const allFormats = {
        ...defaults.date,
        // TODO: time & date vs dateTime. Maybe we should separate
        // time and date, because ICU does this too?
        ...globalFormats?.dateTime
      };

      const options: Intl.DateTimeFormatOptions = {timeZone};
      if (formatNameOrArgs) {
        if (typeof formatNameOrArgs === 'string') {
          if (formatNameOrArgs in allFormats) {
            Object.assign(options, (allFormats as any)[formatNameOrArgs]);
          }
        }
        if (typeof formatNameOrArgs === 'object') {
          Object.assign(options, formatNameOrArgs.parsedOptions);
        }
      }

      // TODO: Use Intl.DateTimeFormat and caching?
      return new Date(value).toLocaleDateString(locale, options);
    },

    time(
      value: number | string,
      locale: string,
      formatNameOrArgs?: FormatNameOrArgs<Intl.DateTimeFormatOptions>
    ) {
      const allFormats = {
        ...defaults.time,
        ...globalFormats?.dateTime
      };

      const options: Intl.DateTimeFormatOptions = {timeZone};
      if (formatNameOrArgs) {
        if (typeof formatNameOrArgs === 'string') {
          if (formatNameOrArgs in allFormats) {
            Object.assign(options, (allFormats as any)[formatNameOrArgs]);
          }
        }
        if (typeof formatNameOrArgs === 'object') {
          Object.assign(options, formatNameOrArgs.parsedOptions);
        }
      }

      // TODO: Use Intl.DateTimeFormat and caching?
      return new Date(value).toLocaleTimeString(locale, options);
    },

    numberFmt(
      value: number,
      locale: string,
      formatNameOrArgs?: FormatNameOrArgs<Intl.NumberFormatOptions>
    ) {
      const allFormats = {
        ...defaults.number,
        ...globalFormats?.number,
        ...formats?.number
      };

      const options: Intl.NumberFormatOptions = {};
      if (formatNameOrArgs) {
        if (typeof formatNameOrArgs === 'string') {
          // Based on https://github.com/messageformat/messageformat/blob/main/packages/runtime/src/fmt/number.ts
          const [formatName, currency] = formatNameOrArgs.split(':') || [];

          if (formatNameOrArgs in allFormats) {
            Object.assign(options, (allFormats as any)[formatName]);
          }
          if (currency) {
            options.currency = currency;
          }
        }
        if (typeof formatNameOrArgs === 'object') {
          Object.assign(options, formatNameOrArgs.parsedOptions);
        }
      }

      // TODO: Caching?
      const format = new Intl.NumberFormat(locale, options);
      return format.format(value);
    }
  };

  return formatters;
}
