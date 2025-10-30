import type {ExtractedMessage, Locale} from '../types.js';

type FormatterContext = {
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
}
