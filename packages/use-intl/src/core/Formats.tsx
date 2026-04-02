import type DateTimeFormatOptions from './DateTimeFormatOptions.js';
import type NumberFormatOptions from './NumberFormatOptions.js';

type Formats = {
  dateTime?: Record<string, DateTimeFormatOptions>;
  displayNames?: Record<string, Intl.DisplayNamesOptions>;
  list?: Record<string, Intl.ListFormatOptions>;
  number?: Record<string, NumberFormatOptions>;
};

export default Formats;
