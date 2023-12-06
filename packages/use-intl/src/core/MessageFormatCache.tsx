import MessageFormat from './MessageFormat';

type MessageFormatCache = Map<
  /** Format: `${locale}.${namespace}.${key}.${message}` */
  string, // Could simplify the key here
  MessageFormat
>;

export default MessageFormatCache;
