/**
 * Built-in styles for date, time and number arguments in messages
 * (e.g. `{value, date, short}`), mirroring `IntlMessageFormat.formats`.
 *
 * Importing these from `intl-messageformat` would pull in its parser,
 * therefore they are duplicated here (a test ensures they stay in sync).
 */

const timeLong: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  timeZoneName: 'short'
};

const defaultFormats = {
  date: {
    short: {month: 'numeric', day: 'numeric', year: '2-digit'},
    medium: {month: 'short', day: 'numeric', year: 'numeric'},
    long: {month: 'long', day: 'numeric', year: 'numeric'},
    full: {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'}
  },
  time: {
    short: {hour: 'numeric', minute: 'numeric'},
    medium: {hour: 'numeric', minute: 'numeric', second: 'numeric'},
    long: timeLong,
    full: timeLong
  },
  number: {
    integer: {maximumFractionDigits: 0},
    currency: {style: 'currency'},
    percent: {style: 'percent'}
  }
} satisfies {
  date: Record<string, Intl.DateTimeFormatOptions>;
  time: Record<string, Intl.DateTimeFormatOptions>;
  number: Record<string, Intl.NumberFormatOptions>;
};

export default defaultFormats;
