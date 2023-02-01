// eslint-disable-next-line import/no-named-as-default -- False positive
import IntlMessageFormat from 'intl-messageformat';
import {useMemo, useRef} from 'react';
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
    onError,
    timeZone
  } = useIntlContext();

  // The `namespacePrefix` is part of the type system.
  // See the comment in the hook invocation.
  allMessages = allMessages[namespacePrefix] as Messages;
  namespace = resolveNamespace(namespace, namespacePrefix) as NestedKey;

  const cachedFormatsByLocaleRef = useRef<
    Record<string, Record<string, IntlMessageFormat>>
  >({});

  const messagesOrError = useMemo(
    () => getMessagesOrError({messages: allMessages, namespace, onError}),
    [allMessages, namespace, onError]
  );

  const translate = useMemo(
    () =>
      createBaseTranslator({
        cachedFormatsByLocale: cachedFormatsByLocaleRef.current,
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
