import DateTimeFormatOptions from './DateTimeFormatOptions';

type Formats = {
  number: Record<string, Intl.NumberFormatOptions>;
  dateTime: Record<string, DateTimeFormatOptions>;
};

export default Formats;
