import ExtractorCodec from '../codecs/ExtractorCodec.js';
import type {ExtractedMessage} from '../types.js';

/**
 * A custom codec that stores messages with flat keys (no nesting).
 * Unlike JSONCodec which creates nested objects for "namespace.key",
 * this codec stores keys like "ui.+YJVTi" as flat strings.
 */
export default class CustomTestCodec extends ExtractorCodec {
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
