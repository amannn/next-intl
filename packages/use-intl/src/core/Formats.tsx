import DateTimeFormatOptions from './DateTimeFormatOptions.tsx';
import NumberFormatOptions from './NumberFormatOptions.tsx';

type Formats = {
  number?: Record<string, NumberFormatOptions>;
  dateTime?: Record<string, DateTimeFormatOptions>;
  list?: Record<string, Intl.ListFormatOptions>;
};

export default Formats;
