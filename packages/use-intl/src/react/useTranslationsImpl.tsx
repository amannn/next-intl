import {useMemo} from 'react';
import AbstractIntlMessages from '../core/AbstractIntlMessages';
import createBaseTranslator, {
  getMessagesOrError
} from '../core/createBaseTranslator';
import resolveNamespace from '../core/resolveNamespace';
import NestedKeyOf from '../core/utils/NestedKeyOf';
import useIntlContext from './useIntlContext';

export default function useTranslationsImpl<
  Messages extends AbstractIntlMessages,
  NestedKey extends NestedKeyOf<Messages>
>(allMessages: Messages, namespace: NestedKey, namespacePrefix: string) {
  const {
    defaultTranslationValues,
    formats: globalFormats,
    getMessageFallback,
    locale,
    messageFormatCache,
    onError,
    timeZone
  } = useIntlContext();

  // The `namespacePrefix` is part of the type system.
  // See the comment in the hook invocation.
  allMessages = allMessages[namespacePrefix] as Messages;
  namespace = resolveNamespace(namespace, namespacePrefix) as NestedKey;

  const messagesOrError = useMemo(
    () => getMessagesOrError({messages: allMessages, namespace, onError}),
    [allMessages, namespace, onError]
  );

  const translate = useMemo(
    () =>
      createBaseTranslator({
        messageFormatCache,
        getMessageFallback,
        messagesOrError,
        defaultTranslationValues,
        namespace,
        onError,
        formats: globalFormats,
        locale,
        timeZone
      }),
    [
      messageFormatCache,
      getMessageFallback,
      messagesOrError,
      defaultTranslationValues,
      namespace,
      onError,
      globalFormats,
      locale,
      timeZone
    ]
  );

  return translate;
}
