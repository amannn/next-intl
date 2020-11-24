import useLocale from './useLocale';

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

  return {formatDateTime, formatNumber};
}
