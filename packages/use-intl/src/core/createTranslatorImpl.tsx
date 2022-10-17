import AbstractIntlMessages from './AbstractIntlMessages';
import IntlError, {IntlErrorCode} from './IntlError';
import {RichTranslationValues, TranslationValue} from './TranslationValues';
import {defaultGetMessageFallback, defaultOnError} from './config';
import createBaseTranslator, {
  CreateBaseTranslatorProps,
  getMessagesOrError
} from './createBaseTranslator';
import resolveNamespace from './resolveNamespace';
import NestedKeyOf from './utils/NestedKeyOf';

export type CoreRichTranslationValues = Record<
  string,
  TranslationValue | ((chunks: string) => string)
>;

export type CreateTranslatorImplProps<Messages> = Omit<
  CreateBaseTranslatorProps<Messages>,
  'messagesOrError' | 'onError' | 'getMessageFallback' | 'namespace'
> & {
  messages: Messages;
  onError?(error: IntlError): void;
  getMessageFallback?(info: {
    error: IntlError;
    key: string;
    namespace?: string;
  }): string;
  namespace: string;
};

export default function createTranslatorImpl<
  Messages extends AbstractIntlMessages,
  NestedKey extends NestedKeyOf<Messages>
>(
  {
    messages,
    namespace,
    onError = defaultOnError,
    getMessageFallback = defaultGetMessageFallback,
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
        __DEV__
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
