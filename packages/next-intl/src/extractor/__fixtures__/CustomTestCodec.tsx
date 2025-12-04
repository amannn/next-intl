import ExtractorCodec from '../codecs/ExtractorCodec.js';
import type {ExtractedMessage} from '../types.js';

export default class CustomTestCodec extends ExtractorCodec {
  readonly EXTENSION = '.custom' as const;

  decode(content: string): Array<ExtractedMessage> {
    const data = JSON.parse(content);
    return Object.entries(data).map(([id, message]) => ({
      id,
      message: message as string
    }));
  }

  encode(messages: Array<ExtractedMessage>): string {
    const obj: Record<string, string> = {};
    for (const msg of messages) {
      obj[msg.id] = msg.message;
    }
    return JSON.stringify(obj, null, 2) + '\n';
  }

  toJSONString(content: string): string {
    return content;
  }
}
