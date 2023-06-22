import DateTimeFormatOptions from './DateTimeFormatOptions';
import NumberFormatOptions from './NumberFormatOptions';

type Formats = {
  number: Record<string, NumberFormatOptions>;
  dateTime: Record<string, DateTimeFormatOptions>;
  list: Record<string, Intl.ListFormatOptions>;
};

export default Formats;
