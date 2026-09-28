import type DateTimeFormatOptions from './DateTimeFormatOptions.js';
import type NumberFormatOptions from './NumberFormatOptions.js';

type Formats = {
  defaults?: {
    dateTime?: DateTimeFormatOptions;
    displayName?: Intl.DisplayNamesOptions;
    list?: Intl.ListFormatOptions;
    number?: NumberFormatOptions;
  };
  dateTime?: Record<string, DateTimeFormatOptions>;
  displayName?: Record<string, Intl.DisplayNamesOptions>;
  list?: Record<string, Intl.ListFormatOptions>;
  number?: Record<string, NumberFormatOptions>;
};

export default Formats;
