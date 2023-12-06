import Formats from './Formats';

// TODO: Move to a scoped cache to avoid memory leaks?
const numberFormats: Record<string, Intl.NumberFormat> = {};

// TODO: time & date vs dateTime. Maybe we should just use dateTime?

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

function formatNumber(
  locale: string | Array<string>,
  opt: Intl.NumberFormatOptions
) {
  const key = String(locale) + JSON.stringify(opt);
  if (!numberFormats[key]) {
    numberFormats[key] = new Intl.NumberFormat(locale, opt);
  }
  return numberFormats[key];
}

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
    numberFmt(
      value: number,
      locale: string,
      arg: string,
      defaultCurrency: string
    ) {
      const allFormats = {
        ...defaults.number,
        ...globalFormats?.number,
        ...formats?.number
      };

      // Based on https://github.com/messageformat/messageformat/blob/main/packages/runtime/src/fmt/number.ts
      const [formatName, currency] = (arg && arg.split(':')) || [];

      const options: Intl.NumberFormatOptions = {currency};

      if (formatName && formatName in allFormats) {
        Object.assign(options, allFormats[formatName]);
      }

      // TODO: Caching?
      const format = new Intl.NumberFormat(locale, options);
      return format.format(value);
    }
  };

  return formatters;
}
