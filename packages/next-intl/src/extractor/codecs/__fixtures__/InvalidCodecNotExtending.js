// This class does not extend Codec
export default class InvalidCodec {
  EXTENSION = '.invalid';

  decode(content) {
    return content;
  }

  encode(messages) {
    return messages;
  }

  toJSONString(content) {
    return content;
  }
}
