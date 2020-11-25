import useLocale from './useLocale';

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
  const locale = useLocale();

  function formatDateTime(
    value: number | Date,
    options?: Intl.DateTimeFormatOptions
  ) {
    return new Intl.DateTimeFormat(locale, options).format(value);
  }

  function formatNumber(value: number, options?: Intl.NumberFormatOptions) {
    return new Intl.NumberFormat(locale, options).format(value);
  }

  function formatRelativeTime(date: number | Date, now: number | Date) {
    const dateDate = date instanceof Date ? date : new Date(date);
    const nowDate = now instanceof Date ? now : new Date(now);

    const seconds = (dateDate.getTime() - nowDate.getTime()) / 1000;
    const {unit, value} = getRelativeTimeFormatConfig(seconds);

    return new Intl.RelativeTimeFormat(locale, {
      numeric: 'auto'
    }).format(value, unit);
  }

  return {formatDateTime, formatNumber, formatRelativeTime};
}
