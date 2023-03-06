import createFormatter from './createFormatter';

/** @deprecated Switch to `createFormatter` */
export default function createIntl(
  ...args: Parameters<typeof createFormatter>
) {
  const formatter = createFormatter(...args);
  return {
    formatDateTime: formatter.dateTime,
    formatNumber: formatter.number,
    formatRelativeTime: formatter.relativeTime
  };
}
