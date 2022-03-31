import {IntlMessageFormat} from 'intl-messageformat';
import {
  cloneElement,
  isValidElement,
  ReactElement,
  ReactNode,
  ReactNodeArray,
  useMemo,
  useRef
} from 'react';
import AbstractIntlMessages from './AbstractIntlMessages';
import Formats from './Formats';
import IntlError, {IntlErrorCode} from './IntlError';
import TranslationValues, {RichTranslationValues} from './TranslationValues';
import convertFormatsToIntlMessageFormat from './convertFormatsToIntlMessageFormat';
import useIntlContext from './useIntlContext';
import MessageKeys from './utils/MessageKeys';
import NestedKeyOf from './utils/NestedKeyOf';
import NestedValueOf from './utils/NestedValueOf';

function resolvePath(
  messages: AbstractIntlMessages | undefined,
  idPath: string,
  namespace?: string
) {
  if (!messages) {
    throw new Error(
      __DEV__ ? `No messages available at \`${namespace}\`.` : undefined
    );
  }

  let message = messages;

  idPath.split('.').forEach((part) => {
    const next = (message as any)[part];

    if (part == null || next == null) {
      throw new Error(
        __DEV__
          ? `Could not resolve \`${idPath}\` in ${
              namespace ? `\`${namespace}\`` : 'messages'
            }.`
          : undefined
      );
    }

    message = next;
  });

  return message;
}

function prepareTranslationValues(values: RichTranslationValues) {
  if (Object.keys(values).length === 0) return undefined;

  // Workaround for https://github.com/formatjs/formatjs/issues/1467
  const transformedValues: RichTranslationValues = {};
  Object.keys(values).forEach((key) => {
    let index = 0;
    const value = values[key];

    let transformed;
    if (typeof value === 'function') {
      transformed = (children: ReactNode) => {
        const result = value(children);

        return isValidElement(result)
          ? cloneElement(result, {key: key + index++})
          : result;
      };
    } else {
      transformed = value;
    }

    transformedValues[key] = transformed;
  });

  return transformedValues;
}

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

  const messagesOrError = useMemo(() => {
    try {
      if (!allMessages) {
        throw new Error(
          __DEV__ ? `No messages were configured on the provider.` : undefined
        );
      }

      const retrievedMessages = namespace
        ? resolvePath(allMessages, namespace)
        : allMessages;

      if (!retrievedMessages) {
        throw new Error(
          __DEV__
            ? `No messages for namespace \`${namespace}\` found.`
            : undefined
        );
      }

      return retrievedMessages;
    } catch (error) {
      const intlError = new IntlError(
        IntlErrorCode.MISSING_MESSAGE,
        (error as Error).message
      );
      onError(intlError);
      return intlError;
    }
  }, [allMessages, namespace, onError]);

  const translate = useMemo(() => {
    function getFallbackFromErrorAndNotify(
      key: string,
      code: IntlErrorCode,
      message?: string
    ) {
      const error = new IntlError(code, message);
      onError(error);
      return getMessageFallback({error, key, namespace});
    }

    function translateBaseFn(
      /** Use a dot to indicate a level of nesting (e.g. `namespace.nestedLabel`). */
      key: string,
      /** Key value pairs for values to interpolate into the message. */
      values?: RichTranslationValues,
      /** Provide custom formats for numbers, dates and times. */
      formats?: Partial<Formats>
    ): string | ReactElement | ReactNodeArray {
      const cachedFormatsByLocale = cachedFormatsByLocaleRef.current;

      if (messagesOrError instanceof IntlError) {
        // We have already warned about this during render
        return getMessageFallback({
          error: messagesOrError,
          key,
          namespace
        });
      }
      const messages = messagesOrError;

      const cacheKey = [namespace, key]
        .filter((part) => part != null)
        .join('.');

      let messageFormat;
      if (cachedFormatsByLocale[locale]?.[cacheKey]) {
        messageFormat = cachedFormatsByLocale[locale][cacheKey];
      } else {
        let message;
        try {
          message = resolvePath(messages, key, namespace);
        } catch (error) {
          return getFallbackFromErrorAndNotify(
            key,
            IntlErrorCode.MISSING_MESSAGE,
            (error as Error).message
          );
        }

        if (typeof message === 'object') {
          return getFallbackFromErrorAndNotify(
            key,
            IntlErrorCode.INSUFFICIENT_PATH,
            __DEV__
              ? `Insufficient path specified for \`${key}\` in \`${
                  namespace ? `\`${namespace}\`` : 'messages'
                }\`.`
              : undefined
          );
        }

        try {
          messageFormat = new IntlMessageFormat(
            message,
            locale,
            convertFormatsToIntlMessageFormat(
              {...globalFormats, ...formats},
              timeZone
            )
          );
        } catch (error) {
          return getFallbackFromErrorAndNotify(
            key,
            IntlErrorCode.INVALID_MESSAGE,
            (error as Error).message
          );
        }

        if (!cachedFormatsByLocale[locale]) {
          cachedFormatsByLocale[locale] = {};
        }
        cachedFormatsByLocale[locale][cacheKey] = messageFormat;
      }

      try {
        const formattedMessage = messageFormat.format(
          prepareTranslationValues({...defaultTranslationValues, ...values})
        );

        if (formattedMessage == null) {
          throw new Error(
            __DEV__
              ? `Unable to format \`${key}\` in ${
                  namespace ? `namespace \`${namespace}\`` : 'messages'
                }`
              : undefined
          );
        }

        // Limit the function signature to return strings or React elements
        return isValidElement(formattedMessage) ||
          // Arrays of React elements
          Array.isArray(formattedMessage) ||
          typeof formattedMessage === 'string'
          ? formattedMessage
          : String(formattedMessage);
      } catch (error) {
        return getFallbackFromErrorAndNotify(
          key,
          IntlErrorCode.FORMATTING_ERROR,
          (error as Error).message
        );
      }
    }

    function translateFn<
      TargetKey extends MessageKeys<
        NestedValueOf<Messages, NestedKey>,
        NestedKeyOf<NestedValueOf<Messages, NestedKey>>
      >
    >(
      /** Use a dot to indicate a level of nesting (e.g. `namespace.nestedLabel`). */
      key: TargetKey,
      /** Key value pairs for values to interpolate into the message. */
      values?: TranslationValues,
      /** Provide custom formats for numbers, dates and times. */
      formats?: Partial<Formats>
    ): string {
      const message = translateBaseFn(key, values, formats);

      if (typeof message !== 'string') {
        return getFallbackFromErrorAndNotify(
          key,
          IntlErrorCode.INVALID_MESSAGE,
          __DEV__
            ? `The message \`${key}\` in ${
                namespace ? `namespace \`${namespace}\`` : 'messages'
              } didn't resolve to a string. If you want to format rich text, use \`t.rich\` instead.`
            : undefined
        );
      }

      return message;
    }

    translateFn.rich = translateBaseFn;

    translateFn.raw = (
      /** Use a dot to indicate a level of nesting (e.g. `namespace.nestedLabel`). */
      key: string
    ): any => {
      if (messagesOrError instanceof IntlError) {
        // We have already warned about this during render
        return getMessageFallback({
          error: messagesOrError,
          key,
          namespace
        });
      }
      const messages = messagesOrError;

      try {
        return resolvePath(messages, key, namespace);
      } catch (error) {
        return getFallbackFromErrorAndNotify(
          key,
          IntlErrorCode.MISSING_MESSAGE,
          (error as Error).message
        );
      }
    };

    return translateFn;
  }, [
    onError,
    getMessageFallback,
    namespace,
    messagesOrError,
    locale,
    globalFormats,
    timeZone,
    defaultTranslationValues
  ]);

  return translate;
}
