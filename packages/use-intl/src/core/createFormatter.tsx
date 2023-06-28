import DateTimeFormatOptions from './DateTimeFormatOptions';
import Formats from './Formats';
import IntlError, {IntlErrorCode} from './IntlError';
import NumberFormatOptions from './NumberFormatOptions';
import TimeZone from './TimeZone';
import {defaultOnError} from './defaults';

const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = DAY * (365 / 12); // Approximation
const YEAR = DAY * 365;

function getRelativeTimeFormatConfig(seconds: number) {
  const absValue = Math.abs(seconds);
  let value, unit: Intl.RelativeTimeFormatUnit;

  // We have to round the resulting values, as `Intl.RelativeTimeFormat`
  // will include fractions like '2.1 hours ago'.

  if (absValue < MINUTE) {
    unit = 'second';
    value = Math.round(seconds);
  } else if (absValue < HOUR) {
    unit = 'minute';
    value = Math.round(seconds / MINUTE);
  } else if (absValue < DAY) {
    unit = 'hour';
    value = Math.round(seconds / HOUR);
  } else if (absValue < WEEK) {
    unit = 'day';
    value = Math.round(seconds / DAY);
  } else if (absValue < MONTH) {
    unit = 'week';
    value = Math.round(seconds / WEEK);
  } else if (absValue < YEAR) {
    unit = 'month';
    value = Math.round(seconds / MONTH);
  } else {
    unit = 'year';
    value = Math.round(seconds / YEAR);
  }

  return {value, unit};
}

type Props = {
  locale: string;
  timeZone?: TimeZone;
  onError?(error: IntlError): void;
  formats?: Partial<Formats>;
  now?: Date;
};

export default function createFormatter({
  formats,
  locale,
  now: globalNow,
  onError = defaultOnError,
  timeZone
}: Props) {
  function resolveFormatOrOptions<Options>(
    typeFormats: Record<string, Options> | undefined,
    formatOrOptions?: string | Options
  ) {
    let options;
    if (typeof formatOrOptions === 'string') {
      const formatName = formatOrOptions;
      options = typeFormats?.[formatName];

      if (!options) {
        const error = new IntlError(
          IntlErrorCode.MISSING_FORMAT,
          process.env.NODE_ENV !== 'production'
            ? `Format \`${formatName}\` is not available. You can configure it on the provider or provide custom options.`
            : undefined
        );
        onError(error);
        throw error;
      }
    } else {
      options = formatOrOptions;
    }

    return options;
  }

  function getFormattedValue<Value, Options>(
    value: Value,
    formatOrOptions: string | Options | undefined,
    typeFormats: Record<string, Options> | undefined,
    formatter: (options?: Options) => string
  ) {
    let options;
    try {
      options = resolveFormatOrOptions(typeFormats, formatOrOptions);
    } catch (error) {
      return String(value);
    }

    try {
      return formatter(options);
    } catch (error) {
      onError(
        new IntlError(IntlErrorCode.FORMATTING_ERROR, (error as Error).message)
      );
      return String(value);
    }
  }

  function dateTime(
    /** If a number is supplied, this is interpreted as a UTC timestamp. */
    value: Date | number,
    /** If a time zone is supplied, the `value` is converted to that time zone.
     * Otherwise the user time zone will be used. */
    formatOrOptions?: string | DateTimeFormatOptions
  ) {
    return getFormattedValue(
      value,
      formatOrOptions,
      formats?.dateTime,
      (options) => {
        if (timeZone && !options?.timeZone) {
          options = {...options, timeZone};
        }

        return new Intl.DateTimeFormat(locale, options).format(value);
      }
    );
  }

  function number(
    value: number | bigint,
    formatOrOptions?: string | NumberFormatOptions
  ) {
    return getFormattedValue(
      value,
      formatOrOptions,
      formats?.number,
      (options) => new Intl.NumberFormat(locale, options).format(value)
    );
  }

  function relativeTime(
    /** The date time that needs to be formatted. */
    date: number | Date,
    /** The reference point in time to which `date` will be formatted in relation to.  */
    now?: number | Date
  ) {
    try {
      if (!now) {
        if (globalNow) {
          now = globalNow;
        } else {
          throw new Error(
            process.env.NODE_ENV !== 'production'
              ? `The \`now\` parameter wasn't provided and there was no global fallback configured on the provider.`
              : undefined
          );
        }
      }

      const dateDate = date instanceof Date ? date : new Date(date);
      const nowDate = now instanceof Date ? now : new Date(now);

      const seconds = (dateDate.getTime() - nowDate.getTime()) / 1000;
      const {unit, value} = getRelativeTimeFormatConfig(seconds);

      return new Intl.RelativeTimeFormat(locale, {
        numeric: 'auto'
      }).format(value, unit);
    } catch (error) {
      onError(
        new IntlError(IntlErrorCode.FORMATTING_ERROR, (error as Error).message)
      );
      return String(date);
    }
  }

  function list(
    value: Iterable<string>,
    formatOrOptions?: string | Intl.ListFormatOptions
  ) {
    return getFormattedValue(value, formatOrOptions, formats?.list, (options) =>
      new Intl.ListFormat(locale, options).format(value)
    );
  }

  return {dateTime, number, relativeTime, list};
}
