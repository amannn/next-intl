import {RichTranslationValues, TranslationValue} from './TranslationValues';
import createBaseTranslator, {
  CreateTranslatorProps,
  getMessagesOrError
} from './createBaseTranslator';
import NestedKeyOf from './utils/NestedKeyOf';
import {AbstractIntlMessages, IntlError} from '.';

export type ServerRichTranslationValues = Record<
  string,
  TranslationValue | ((chunks: string) => string)
>;

export default function createTranslatorImpl<
  Messages extends AbstractIntlMessages,
  NestedKey extends NestedKeyOf<Messages>
>(
  props: Omit<CreateTranslatorProps<Messages>, 'messagesOrError'> & {
    messages: Messages;
  }
) {
  const translator = createBaseTranslator<Messages, NestedKey>({
    ...props,
    messagesOrError: getMessagesOrError({
      messages: props.messages,
      namespace: props.namespace,
      onError: props.onError
    }) as Messages | IntlError
  });

  const originalRich = translator.rich;

  function base(...args: Parameters<typeof translator>) {
    return translator(...args);
  }

  // Augment `t.rich` to return plain strings
  base.rich = (
    key: Parameters<typeof originalRich>[0],
    /** Key value pairs for values to interpolate into the message. */
    values: ServerRichTranslationValues,
    formats?: Parameters<typeof originalRich>[2]
  ): string => {
    // `chunks` is returned as a string when no React element
    // is used, therefore it's safe to cast this type.
    const result = originalRich(key, values as RichTranslationValues, formats);

    // When only string chunks are provided to the parser, only strings should be returned here.
    if (typeof result !== 'string') {
      throw new Error(
        __DEV__
          ? 'Received non-string result from `t.rich`. This should never happen, please file an issue.'
          : undefined
      );
    }

    return result;
  };

  base.raw = translator.raw;

  return base;
}
