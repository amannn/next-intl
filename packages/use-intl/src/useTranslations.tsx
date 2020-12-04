import IntlMessageFormat, {Formats} from 'intl-messageformat';
import {cloneElement, isValidElement, ReactNode, useMemo, useRef} from 'react';
import IntlError, {IntlErrorCode} from './IntlError';
import IntlMessages from './IntlMessages';
import TranslationValues from './TranslationValues';
import useIntlContext from './useIntlContext';
import useLocale from './useLocale';

function resolvePath(
  messages: IntlMessages,
  idPath: string,
  namespace?: string
) {
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

function prepareTranslationValues(values?: TranslationValues) {
  if (!values) return values;

  // Workaround for https://github.com/formatjs/formatjs/issues/1467
  const transformedValues: TranslationValues = {};
  Object.keys(values).forEach((key) => {
    const value = values[key];

    let transformed;
    if (typeof value === 'function') {
      transformed = (children: ReactNode) => {
        const result = value(children);

        return isValidElement(result)
          ? cloneElement(result, {
              key: result.key || key + String(children)
            })
          : result;
      };
    } else {
      transformed = value;
    }

    transformedValues[key] = transformed;
  });

  return transformedValues;
}

/**
 * Translates messages from the given namespace by using the ICU syntax.
 * See https://formatjs.io/docs/core-concepts/icu-syntax.
 *
 * If no namespace is provided, all available messages are returned.
 * The namespace can also indicate nesting by using a dot
 * (e.g. `namespace.Component`).
 */
export default function useTranslations(namespace?: string) {
  const context = useIntlContext();
  const locale = useLocale();
  const cachedFormatsByLocaleRef = useRef<
    Record<string, Record<string, IntlMessageFormat>>
  >({});
  const allMessages = context.messages;

  const messagesOrError = useMemo(() => {
    try {
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
        error.message
      );
      context.onError(intlError);
      return intlError;
    }
  }, [allMessages, context, namespace]);

  function translate(
    /** Use a dot to indicate a level of nesting (e.g. `namespace.nestedLabel`). */
    key: string,
    /** Key value pairs for values to interpolate into the message. */
    values?: TranslationValues,
    /** Provide custom formats for numbers, dates and times. */
    formats?: Partial<Formats>
  ) {
    const cachedFormatsByLocale = cachedFormatsByLocaleRef.current;

    function getFallbackFromError(code: IntlErrorCode, message?: string) {
      const error = new IntlError(code, message);
      context.onError(error);
      return context.getMessageFallback({error, key, namespace});
    }

    if (messagesOrError instanceof IntlError) {
      // We have already warned about this during render
      return context.getMessageFallback({
        error: messagesOrError,
        key,
        namespace
      });
    }
    const messages = messagesOrError;

    let messageFormat;
    if (cachedFormatsByLocale[locale]?.[key]) {
      messageFormat = cachedFormatsByLocale[locale][key];
    } else {
      let message;
      try {
        message = resolvePath(messages, key, namespace);
      } catch (error) {
        return getFallbackFromError(
          IntlErrorCode.MISSING_MESSAGE,
          error.message
        );
      }

      if (typeof message === 'object') {
        return getFallbackFromError(
          IntlErrorCode.INSUFFICIENT_PATH,
          __DEV__
            ? `Insufficient path specified for \`${key}\` in \`${namespace}\`.`
            : undefined
        );
      }

      try {
        messageFormat = new IntlMessageFormat(message, locale, formats);
      } catch (error) {
        return getFallbackFromError(
          IntlErrorCode.INVALID_MESSAGE,
          error.message
        );
      }

      if (!cachedFormatsByLocale[locale]) {
        cachedFormatsByLocale[locale] = {};
      }
      cachedFormatsByLocale[locale][key] = messageFormat;
    }

    try {
      const formattedMessage = messageFormat.format(
        prepareTranslationValues(values)
      );

      if (formattedMessage == null) {
        throw new Error(
          __DEV__ ? `Unable to format ${[namespace, key].join('.')}` : undefined
        );
      }

      return formattedMessage;
    } catch (error) {
      return getFallbackFromError(
        IntlErrorCode.FORMATTING_ERROR,
        error.message
      );
    }
  }

  return translate;
}
