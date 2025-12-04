import type {ExtractedMessage, Locale} from '../types.js';

export type ExtractorCodecContext = {
  locale: Locale;
};

export default abstract class ExtractorCodec {
  /**
   * Decode the content of a file into a list of extracted messages. This is used
   * to load existing messages from disk.
   **/
  abstract decode(
    content: string,
    context: ExtractorCodecContext
  ): Array<ExtractedMessage>;

  /**
   * Encode a list of extracted messages into a string that can be written as
   * file content to the disk.
   **/
  abstract encode(
    messages: Array<ExtractedMessage>,
    context: ExtractorCodecContext
  ): string;

  /**
   * Turns the content of a file into a JSON string that represents extracted
   * messages. The returned value will be passed to `JSON.parse`.
   *
   * @return E.g. `[{"id":"+YJVTi","message":"Hey!"}]`
   *
   * This is used when loading messages into your application, typically via a
   * dynamic import (e.g. `import(`../messages/${locale}.json`)`).
   *
   * If your file content is JSON and should be used as-is, you can set this to
   * an identity function.
   **/
  abstract toJSONString(
    content: string,
    context: ExtractorCodecContext
  ): string;
}
