import type {ExtractedMessage} from '../types';

type Formatter = {
  write(messages: Array<ExtractedMessage>): Promise<void>;
};

export default Formatter;
