import type {ExtractorMessage, Locale} from '../types.js';

type ExtractorCodecContext = {
  locale: Locale;
};

export default interface ExtractorCodec {
  /**
   * Decode the content of a file into a list of extracted messages. This is used
   * to load existing messages from disk.
   */
  decode(
    content: string,
    context: ExtractorCodecContext
  ): Array<ExtractorMessage>;

  /**
   * Encode a list of extracted messages into a string that can be written as
   * file content to the disk.
   */
  encode(
    messages: Array<ExtractorMessage>,
    context: ExtractorCodecContext & {
      sourceMessagesById: Map</* ID */ string, ExtractorMessage>;
    }
  ): string;

  /**
   * @deprecated No longer used. Catalogs are loaded into your application via
   * `decode`, so you can remove `toJSONString` from your codec. Providing it
   * logs a deprecation warning and has no effect.
   */
  toJSONString?(content: string, context: ExtractorCodecContext): string;
}

export function defineCodec(factory: () => ExtractorCodec) {
  return factory;
}
