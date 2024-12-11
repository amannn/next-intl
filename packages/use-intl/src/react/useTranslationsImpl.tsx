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
>(
  allMessagesPrefixed: Messages,
  namespacePrefixed: NestedKey,
  namespacePrefix: string
) {
  const {
    cache,
    defaultTranslationValues,
    formats: globalFormats,
    formatters,
    getMessageFallback,
    locale,
    onError,
    timeZone
  } = useIntlContext();

  // The `namespacePrefix` is part of the type system.
  // See the comment in the hook invocation.
  const allMessages = allMessagesPrefixed[namespacePrefix] as Messages;
  const namespace = resolveNamespace(
    namespacePrefixed,
    namespacePrefix
  ) as NestedKey;

  if (!timeZone && !hasWarnedForMissingTimezone && isServer) {
    // eslint-disable-next-line react-compiler/react-compiler
    hasWarnedForMissingTimezone = true;
    onError(
      new IntlError(
        IntlErrorCode.ENVIRONMENT_FALLBACK,
        process.env.NODE_ENV !== 'production'
          ? `There is no \`timeZone\` configured, this can lead to markup mismatches caused by environment differences. Consider adding a global default: https://next-intl.dev/docs/configuration#time-zone`
          : undefined
      )
    );
  }

  const translate = useMemo(
    () =>
      createBaseTranslator({
        cache,
        formatters,
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
      cache,
      formatters,
      getMessageFallback,
      allMessages,
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
