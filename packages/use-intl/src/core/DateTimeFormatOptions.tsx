// https://github.com/microsoft/TypeScript/issues/35865

import TimeZone from './TimeZone';

/**
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
 */
type DateTimeFormatOptions = Intl.DateTimeFormatOptions & {
  /**
   * Examples:
   * - numeric: "2021"
   * - 2-digit: "21"
   */
  year?: 'numeric' | '2-digit';

  /** Examples:
   * - numeric: "3"
   * - 2-digit: "03"
   * - long: "March"
   * - short: "Mar"
   * - narrow: "M"
   */
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';

  /** Examples:
   * - numeric: "2"
   * - 2-digit: "02"
   */
  day?: 'numeric' | '2-digit';

  /** Examples:
   * - numeric: "2"
   * - 2-digit: "02"
   */
  hour?: 'numeric' | '2-digit';

  /** Examples:
   * - numeric: "2"
   * - 2-digit: "02"
   */
  minute?: 'numeric' | '2-digit';

  /** Examples:
   * - numeric: "2"
   * - 2-digit: "02"
   */
  second?: 'numeric' | '2-digit';

  /** Examples:
   * - long: "Thursday"
   * - short: "Thu"
   * - narrow: "T"
   */
  weekday?: 'long' | 'short' | 'narrow';

  /** Examples:
   * - long: "Anno Domini"
   * - short: "AD", narrow "A"
   */
  era?: 'long' | 'short' | 'narrow';

  /** If this is set to `true`, a 12-hour am/pm format is used. Otherwise a 24-hour time.
   *
   */
  hour12?: boolean;

  /** Examples:
   * - long: "Pacific Daylight Time"
   * - short: "PDT"
   */
  timeZoneName?: 'long' | 'short';

  /**
   * One of the [database names from the TZ database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List).
   */
  timeZone?: TimeZone;

  localeMatcher?: 'best fit' | 'lookup';

  formatMatcher?: 'best fit' | 'basic';

  dateStyle?: 'full' | 'long' | 'medium' | 'short';

  timeStyle?: 'full' | 'long' | 'medium' | 'short';

  calendar?:
    | 'buddhist'
    | 'chinese'
    | 'coptic'
    | 'ethiopia'
    | 'ethiopic'
    | 'gregory'
    | 'hebrew'
    | 'indian'
    | 'islamic'
    | 'iso8601'
    | 'japanese'
    | 'persian'
    | 'roc';

  dayPeriod?: 'narrow' | 'short' | 'long';

  numberingSystem?:
    | 'arab'
    | 'arabext'
    | 'bali'
    | 'beng'
    | 'deva'
    | 'fullwide'
    | 'gujr'
    | 'guru'
    | 'hanidec'
    | 'khmr'
    | 'knda'
    | 'laoo'
    | 'latn'
    | 'limb'
    | 'mlym'
    | 'mong'
    | 'mymr'
    | 'orya'
    | 'tamldec'
    | 'telu'
    | 'thai'
    | 'tibt';

  hourCycle?: 'h11' | 'h12' | 'h23' | 'h24';
};

export default DateTimeFormatOptions;
