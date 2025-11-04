import type {ExtractedMessage, Locale} from '../types.js';

export type FormatterContext = {
  locale: Locale;
};

export default abstract class Formatter {
  abstract readonly EXTENSION: `.${string}`;

  abstract parse(
    content: string,
    context: FormatterContext
  ): Array<ExtractedMessage>;

  abstract serialize(
    messages: Array<ExtractedMessage>,
    context: FormatterContext
  ): string;

  abstract toJSONString(source: string, context: FormatterContext): string;
}
