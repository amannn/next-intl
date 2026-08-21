import {defineCodec} from '../../ExtractorCodec.js';

type StoredMessage = {message: string; description?: Array<string>};

export default defineCodec(() => ({
  decode(content) {
    const data = JSON.parse(content);
    return Object.entries(data).map(([id, value]) => {
      const obj = value as StoredMessage;
      return {
        id,
        message: obj.message,
        references: [],
        description: obj.description ?? []
      };
    });
  },

  encode(messages) {
    const obj: Record<string, StoredMessage> = {};
    for (const msg of messages) {
      obj[msg.id] = {
        message: msg.message,
        ...(msg.description.length > 0 && {description: msg.description})
      };
    }
    return JSON.stringify(obj, null, 2) + '\n';
  }
}));
