import IntlError, {IntlErrorCode} from './IntlError';
import useIntlContext from './useIntlContext';

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

export default function useIntl() {
  const {formats, locale, onError} = useIntlContext();

  function resolveFormatOrOptions<Format>(
    typeFormats: Record<string, Format> | undefined,
    formatOrOptions?: string | Format
  ) {
    let format;
    if (typeof formatOrOptions === 'string') {
      const formatName = formatOrOptions;
      format = typeFormats?.[formatName];

      if (!format) {
        const error = new IntlError(
          IntlErrorCode.MISSING_FORMAT,
          __DEV__
            ? `Format \`${formatName}\` is not available. You can configure it on the provider or provide custom options.`
            : undefined
        );
        onError(error);
        throw error;
      }
    } else {
      format = formatOrOptions;
    }

    return format;
  }

  function getFormattedValue<Value, Format>(
    value: Value,
    formatOrOptions: string | Format,
    typeFormats: Record<string, Format> | undefined,
    formatter: (format?: Format) => string
  ) {
    let format;
    try {
      format = resolveFormatOrOptions(typeFormats, formatOrOptions);
    } catch (error) {
      return String(value);
    }

    try {
      return formatter(format);
    } catch (error) {
      onError(new IntlError(IntlErrorCode.FORMATTING_ERROR, error.message));
      return String(value);
    }
  }

  function formatDateTime(
    value: number | Date,
    formatOrOptions?: string | Intl.DateTimeFormatOptions
  ) {
    return getFormattedValue(
      value,
      formatOrOptions,
      {...formats?.dateTime},
      (format) => new Intl.DateTimeFormat(locale, format).format(value)
    );
  }

  function formatNumber(
    value: number,
    formatOrOptions?: string | Intl.NumberFormatOptions
  ) {
    return getFormattedValue(
      value,
      formatOrOptions,
      formats?.number,
      (format) => new Intl.NumberFormat(locale, format).format(value)
    );
  }

  function formatRelativeTime(date: number | Date, now: number | Date) {
    const dateDate = date instanceof Date ? date : new Date(date);
    const nowDate = now instanceof Date ? now : new Date(now);

    const seconds = (dateDate.getTime() - nowDate.getTime()) / 1000;
    const {unit, value} = getRelativeTimeFormatConfig(seconds);

    try {
      return new Intl.RelativeTimeFormat(locale, {
        numeric: 'auto'
      }).format(value, unit);
    } catch (error) {
      onError(new IntlError(IntlErrorCode.FORMATTING_ERROR, error.message));
      return String(date);
    }
  }

  return {formatDateTime, formatNumber, formatRelativeTime};
}
