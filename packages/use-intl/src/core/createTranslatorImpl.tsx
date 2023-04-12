import AbstractIntlMessages from './AbstractIntlMessages';
import {InitializedIntlConfig} from './IntlConfig';
import IntlError, {IntlErrorCode} from './IntlError';
import {RichTranslationValues, TranslationValue} from './TranslationValues';
import createBaseTranslator, {getMessagesOrError} from './createBaseTranslator';
import resolveNamespace from './resolveNamespace';
import NestedKeyOf from './utils/NestedKeyOf';

export type CoreRichTranslationValues = Record<
  string,
  TranslationValue | ((chunks: string) => string)
>;

export type CreateTranslatorImplProps<Messages> = Omit<
  InitializedIntlConfig,
  'messages'
> & {
  namespace: string;
  messages: Messages;
};

export default function createTranslatorImpl<
  Messages extends AbstractIntlMessages,
  NestedKey extends NestedKeyOf<Messages>
>(
  {
    getMessageFallback,
    messages,
    namespace,
    onError,
    ...rest
  }: CreateTranslatorImplProps<Messages>,
  namespacePrefix: string
) {
  // The `namespacePrefix` is part of the type system.
  // See the comment in the function invocation.
  messages = messages[namespacePrefix] as Messages;
  namespace = resolveNamespace(namespace, namespacePrefix) as NestedKey;

  const translator = createBaseTranslator<Messages, NestedKey>({
    ...rest,
    onError,
    getMessageFallback,
    messagesOrError: getMessagesOrError({
      messages,
      namespace,
      onError
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
    values: CoreRichTranslationValues,
    formats?: Parameters<typeof originalRich>[2]
  ): string => {
    // `chunks` is returned as a string when no React element
    // is used, therefore it's safe to cast this type.
    const result = originalRich(key, values as RichTranslationValues, formats);

    // When only string chunks are provided to the parser, only strings should be returned here.
    if (typeof result !== 'string') {
      const error = new IntlError(
        IntlErrorCode.FORMATTING_ERROR,
        process.env.NODE_ENV !== 'production'
          ? "`createTranslator` only accepts functions for rich text formatting that receive and return strings.\n\nE.g. t.rich('rich', {b: (chunks) => `<b>${chunks}</b>`})"
          : undefined
      );

      onError(error);
      return getMessageFallback({error, key, namespace});
    }

    return result;
  };

  base.raw = translator.raw;

  return base;
}
