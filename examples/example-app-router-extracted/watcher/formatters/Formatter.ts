import type {ExtractedMessage} from '../types';

type Formatter = {
  EXTENSION: string;
  write(locale: string, messages: Array<ExtractedMessage>): Promise<void>;
};

export default Formatter;
