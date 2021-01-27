// https://github.com/microsoft/TypeScript/issues/35865

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
  timeZone?: string;

  localeMatcher?: 'best fit' | 'lookup';

  formatMatcher?: 'best fit' | 'basic';
};

export default DateTimeFormatOptions;
