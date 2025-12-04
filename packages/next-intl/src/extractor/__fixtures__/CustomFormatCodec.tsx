import ExtractorCodec from '../codecs/ExtractorCodec.js';
import type {ExtractedMessage} from '../types.js';

type StoredMessage = {message: string; description?: string};

export default class CustomTestCodec extends ExtractorCodec {
  decode(content: string): Array<ExtractedMessage> {
    const data = JSON.parse(content);
    return Object.entries(data).map(([id, value]) => {
      const obj = value as StoredMessage;
      return {
        id,
        message: obj.message,
        ...(obj.description && {description: obj.description})
      };
    });
  }

  encode(messages: Array<ExtractedMessage>): string {
    const obj: Record<string, StoredMessage> = {};
    for (const msg of messages) {
      obj[msg.id] = {
        message: msg.message,
        ...(msg.description && {description: msg.description})
      };
    }
    return JSON.stringify(obj, null, 2) + '\n';
  }

  toJSONString(content: string): string {
    const data = JSON.parse(content);
    const result: Record<string, string> = {};
    for (const [id, value] of Object.entries(data)) {
      const obj = value as StoredMessage;
      result[id] = obj.message;
    }
    return JSON.stringify(result, null, 2);
  }
}
