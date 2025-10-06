import type {ExtractedMessage, Locale} from '../types.js';

type Formatter = {
  EXTENSION: `.${string}`;
  read(locale: Locale): Promise<Array<ExtractedMessage>>;
  write(locale: Locale, messages: Array<ExtractedMessage>): Promise<void>;
};

export default Formatter;
