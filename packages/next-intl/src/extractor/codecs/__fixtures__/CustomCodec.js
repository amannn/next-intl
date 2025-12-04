import Codec from '../Codec.js';

export default class CustomCodec extends Codec {
  EXTENSION = '.custom';

  decode(content) {
    return JSON.parse(content);
  }

  encode(messages) {
    return JSON.stringify(messages, null, 2);
  }

  toJSONString(content) {
    return content;
  }
}
