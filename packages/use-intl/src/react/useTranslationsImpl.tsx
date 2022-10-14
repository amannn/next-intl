import {IntlMessageFormat} from 'intl-messageformat';
import {useMemo, useRef} from 'react';
import AbstractIntlMessages from '../core/AbstractIntlMessages';
import createTranslator, {getMessagesOrError} from '../core/createTranslator';
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
  namespace = (
    namespace === namespacePrefix
      ? undefined
      : namespace.slice((namespacePrefix + '.').length)
  ) as NestedKey;

  const cachedFormatsByLocaleRef = useRef<
    Record<string, Record<string, IntlMessageFormat>>
  >({});

  const messagesOrError = useMemo(
    () => getMessagesOrError({messages: allMessages, namespace, onError}),
    [allMessages, namespace, onError]
  );

  const translate = useMemo(
    () =>
      createTranslator({
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
