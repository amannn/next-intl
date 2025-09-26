import type {ReactNode} from 'react';
import type {
  MarkupTagsFunction,
  RichTagsFunction
} from '../core/TranslationValues.js';
import type {TranslateArgs} from '../core/createTranslator.js';

export default function useExtracted(namespace?: string) {
  function translateFn<Message extends string>(
    /** Inline ICU message in the source locale. */
    message: Message,
    ...[values, formats]: TranslateArgs<Message>
  ): string {
    // eslint-disable-next-line no-console -- WIP
    console.log('useExtracted translateFn', {
      message,
      namespace,
      values,
      formats
    });
    return message;
  }

  translateFn.rich = function translateRichFn<Message extends string>(
    message: Message,
    ...[values, formats]: TranslateArgs<Message, RichTagsFunction>
  ): ReactNode {
    // eslint-disable-next-line no-console -- WIP
    console.log('useExtracted translateRichFn', {
      message,
      namespace,
      values,
      formats
    });
    return message;
  };

  translateFn.markup = function translateMarkupFn<Message extends string>(
    message: Message,
    ...[values, formats]: TranslateArgs<Message, MarkupTagsFunction>
  ): string {
    // eslint-disable-next-line no-console -- WIP
    console.log('useExtracted translateMarkupFn', {
      message,
      namespace,
      values,
      formats
    });
    return message;
  };

  return translateFn;
}
