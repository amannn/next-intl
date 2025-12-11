import {getSortedMessages, setNestedProperty} from '../../utils.js';
import {defineCodec} from '../ExtractorCodec.js';

interface StoredFormat {
  [key: string]: string | StoredFormat;
}

export default defineCodec(() => ({
  decode(source) {
    const json: StoredFormat = JSON.parse(source);
    const messages: Array<{id: string; message: string}> = [];

    traverseMessages(json, (message, id) => {
      messages.push({id, message});
    });

    return messages;
  },

  encode(messages) {
    const root: StoredFormat = {};
    for (const message of getSortedMessages(messages)) {
      setNestedProperty(root, message.id, message.message);
    }
    return JSON.stringify(root, null, 2) + '\n';
  },

  toJSONString(source) {
    return source;
  }
}));

function traverseMessages(
  obj: StoredFormat,
  callback: (value: string, path: string) => void,
  path = ''
): void {
  const NAMESPACE_SEPARATOR = '.';

  for (const key of Object.keys(obj)) {
    const newPath = path ? path + NAMESPACE_SEPARATOR + key : key;
    const value = obj[key];
    if (typeof value === 'string') {
      callback(value, newPath);
    } else if (value !== null && typeof value === 'object') {
      traverseMessages(value, callback, newPath);
    }
  }
}
