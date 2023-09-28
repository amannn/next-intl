import {useMemo} from 'react';
import {IntlError, IntlErrorCode} from '../core';
import AbstractIntlMessages from '../core/AbstractIntlMessages';
import createBaseTranslator from '../core/createBaseTranslator';
import resolveNamespace from '../core/resolveNamespace';
import NestedKeyOf from '../core/utils/NestedKeyOf';
import useIntlContext from './useIntlContext';

let hasWarnedForMissingTimezone = false;
const isServer = typeof window === 'undefined';

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

  if (!timeZone && !hasWarnedForMissingTimezone && isServer) {
    hasWarnedForMissingTimezone = true;
    onError(
      new IntlError(
        IntlErrorCode.ENVIRONMENT_FALLBACK,
        process.env.NODE_ENV !== 'production'
          ? `There is no \`timeZone\` configured, this can lead to markup mismatches caused by environment differences. Consider adding a global default: https://next-intl-docs.vercel.app/docs/configuration#time-zone`
          : undefined
      )
    );
  }

  const translate = useMemo(
    () =>
      createBaseTranslator({
        messageFormatCache,
        getMessageFallback,
        messages: allMessages,
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
      allMessages,
      namespace,
      onError,
      defaultTranslationValues,
      globalFormats,
      locale,
      timeZone
    ]
  );

  return translate;
}
