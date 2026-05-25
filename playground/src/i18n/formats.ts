import type {Formats} from 'next-intl';

export const formats = {
  dateTime: {
    short: {dateStyle: 'short'},
    long: {dateStyle: 'long', timeStyle: 'short'},
    shortTime: {timeStyle: 'short'}
  },
  number: {
    precise: {maximumFractionDigits: 5},
    currency: {style: 'currency', currency: 'USD'},
    percent: {style: 'percent', maximumFractionDigits: 2}
  },
  list: {
    or: {type: 'disjunction'},
    and: {type: 'conjunction'}
  }
} satisfies Formats;

export type FormatRegistry = typeof formats;
