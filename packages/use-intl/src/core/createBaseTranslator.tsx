// eslint-disable-next-line import/no-named-as-default -- False positive
import IntlMessageFormat from 'intl-messageformat';
import {
  cloneElement,
  isValidElement,
  ReactElement,
  ReactNode,
  ReactNodeArray
} from 'react';
import AbstractIntlMessages from './AbstractIntlMessages';
import Formats from './Formats';
import {InitializedIntlConfig} from './IntlConfig';
import IntlError, {IntlErrorCode} from './IntlError';
import MessageFormatCache from './MessageFormatCache';
import TranslationValues, {
  MarkupTranslationValues,
  RichTranslationValues
} from './TranslationValues';
import convertFormatsToIntlMessageFormat from './convertFormatsToIntlMessageFormat';
import {defaultGetMessageFallback, defaultOnError} from './defaults';
import joinPath from './joinPath';
import MessageKeys from './utils/MessageKeys';
import NestedKeyOf from './utils/NestedKeyOf';
import NestedValueOf from './utils/NestedValueOf';

function resolvePath(
  messages: AbstractIntlMessages | undefined,
  key: string,
  namespace?: string
) {
  const fullKey = joinPath(namespace, key);

  if (!messages) {
    throw new Error(
      process.env.NODE_ENV !== 'production'
        ? `No messages available at \`${namespace}\`.`
        : fullKey
    );
  }

  let message = messages;

  key.split('.').forEach((part) => {
    const next = (message as any)[part];

    if (part == null || next == null) {
      throw new Error(
        process.env.NODE_ENV !== 'production'
          ? `Could not resolve \`${fullKey}\` in messages.`
          : fullKey
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
      transformed = (chunks: ReactNode) => {
        const result = value(chunks);

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

function getMessagesOrError<Messages extends AbstractIntlMessages>({
  messages,
  namespace,
  onError = defaultOnError
}: {
  messages?: Messages;
  namespace?: string;
  onError?(error: IntlError): void;
}) {
  try {
    if (!messages) {
      throw new Error(
        process.env.NODE_ENV !== 'production'
          ? `No messages were configured on the provider.`
          : undefined
      );
    }

    const retrievedMessages = namespace
      ? resolvePath(messages, namespace)
      : messages;

    if (!retrievedMessages) {
      throw new Error(
        process.env.NODE_ENV !== 'production'
          ? `No messages for namespace \`${namespace}\` found.`
          : namespace
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
}

export type CreateBaseTranslatorProps<Messages> = InitializedIntlConfig & {
  messageFormatCache?: MessageFormatCache;
  defaultTranslationValues?: RichTranslationValues;
  namespace?: string;
  messagesOrError: Messages | IntlError;
};

function getPlainMessage(candidate: string, values?: unknown) {
  if (values) return undefined;

  const unescapedMessage = candidate.replace(/'([{}])/gi, '$1');

  // Placeholders can be in the message if there are default values,
  // or if the user has forgotten to provide values. In the latter
  // case we need to compile the message to receive an error.
  const hasPlaceholders = /<|{/.test(unescapedMessage);

  if (!hasPlaceholders) {
    return unescapedMessage;
  }

  return undefined;
}

export default function createBaseTranslator<
  Messages extends AbstractIntlMessages,
  NestedKey extends NestedKeyOf<Messages>
>(config: Omit<CreateBaseTranslatorProps<Messages>, 'messagesOrError'>) {
  const messagesOrError = getMessagesOrError({
    messages: config.messages,
    namespace: config.namespace,
    onError: config.onError
  }) as Messages | IntlError;

  return createBaseTranslatorImpl<Messages, NestedKey>({
    ...config,
    messagesOrError
  });
}

function createBaseTranslatorImpl<
  Messages extends AbstractIntlMessages,
  NestedKey extends NestedKeyOf<Messages>
>({
  defaultTranslationValues,
  formats: globalFormats,
  getMessageFallback = defaultGetMessageFallback,
  locale,
  messageFormatCache,
  messagesOrError,
  namespace,
  onError,
  timeZone
}: CreateBaseTranslatorProps<Messages>) {
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
    if (messagesOrError instanceof IntlError) {
      // We have already warned about this during render
      return getMessageFallback({
        error: messagesOrError,
        key,
        namespace
      });
    }
    const messages = messagesOrError;

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

    const cacheKey = joinPath(locale, namespace, key, String(message));

    let messageFormat: IntlMessageFormat;
    if (messageFormatCache?.has(cacheKey)) {
      messageFormat = messageFormatCache.get(cacheKey)!;
    } else {
      if (typeof message === 'object') {
        let code, errorMessage;
        if (Array.isArray(message)) {
          code = IntlErrorCode.INVALID_MESSAGE;
          if (process.env.NODE_ENV !== 'production') {
            errorMessage = `Message at \`${joinPath(
              namespace,
              key
            )}\` resolved to an array, but only strings are supported. See https://next-intl-docs.vercel.app/docs/usage/messages#arrays-of-messages`;
          }
        } else {
          code = IntlErrorCode.INSUFFICIENT_PATH;
          if (process.env.NODE_ENV !== 'production') {
            errorMessage = `Message at \`${joinPath(
              namespace,
              key
            )}\` resolved to an object, but only strings are supported. Use a \`.\` to retrieve nested messages. See https://next-intl-docs.vercel.app/docs/usage/messages#structuring-messages`;
          }
        }

        return getFallbackFromErrorAndNotify(key, code, errorMessage);
      }

      // Hot path that avoids creating an `IntlMessageFormat` instance
      const plainMessage = getPlainMessage(message as string, values);
      if (plainMessage) return plainMessage;

      try {
        messageFormat = new IntlMessageFormat(
          message,
          locale,
          convertFormatsToIntlMessageFormat(
            {...globalFormats, ...formats},
            timeZone
          ),
          {
            formatters: {
              getNumberFormat(locales, options) {
                // @ts-expect-error -- intl-messageformat does the same, maybe an issue on their side
                // https://github.com/formatjs/formatjs/blob/f49187da6dd9ff9142f8e4026a4ab8b1276c3af1/packages/intl-messageformat/src/core.ts#L93
                return new Intl.NumberFormat(locales, options);
              },
              getDateTimeFormat(locales, options) {
                // Workaround for https://github.com/formatjs/formatjs/issues/4279
                return new Intl.DateTimeFormat(locales, {timeZone, ...options});
              },
              getPluralRules(locales, options) {
                return new Intl.PluralRules(locales, options);
              }
            }
          }
        );
      } catch (error) {
        const thrownError = error as Error;
        return getFallbackFromErrorAndNotify(
          key,
          IntlErrorCode.INVALID_MESSAGE,
          process.env.NODE_ENV !== 'production'
            ? thrownError.message +
                ('originalMessage' in thrownError
                  ? ` (${thrownError.originalMessage})`
                  : '')
            : thrownError.message
        );
      }

      messageFormatCache?.set(cacheKey, messageFormat);
    }

    try {
      const formattedMessage = messageFormat.format(
        // @ts-expect-error `intl-messageformat` expects a different format
        // for rich text elements since a recent minor update. This
        // needs to be evaluated in detail, possibly also in regards
        // to be able to format to parts.
        prepareTranslationValues({...defaultTranslationValues, ...values})
      );

      if (formattedMessage == null) {
        throw new Error(
          process.env.NODE_ENV !== 'production'
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
    const result = translateBaseFn(key, values, formats);

    if (typeof result !== 'string') {
      return getFallbackFromErrorAndNotify(
        key,
        IntlErrorCode.INVALID_MESSAGE,
        process.env.NODE_ENV !== 'production'
          ? `The message \`${key}\` in ${
              namespace ? `namespace \`${namespace}\`` : 'messages'
            } didn't resolve to a string. If you want to format rich text, use \`t.rich\` instead.`
          : undefined
      );
    }

    return result;
  }

  translateFn.rich = translateBaseFn;

  // Augment `translateBaseFn` to return plain strings
  translateFn.markup = (
    key: Parameters<typeof translateBaseFn>[0],
    /** Key value pairs for values to interpolate into the message. */
    values: MarkupTranslationValues,
    formats?: Parameters<typeof translateBaseFn>[2]
  ): string => {
    const result = translateBaseFn(
      key,
      // @ts-expect-error -- `MarkupTranslationValues` is practically a sub type
      // of `RichTranslationValues` but TypeScript isn't smart enough here.
      values,
      formats
    );

    // When only string chunks are provided to the parser, only
    // strings should be returned here. Note that we need a runtime
    // check for this since rich text values could be accidentally
    // inherited from `defaultTranslationValues`.
    if (typeof result !== 'string') {
      const error = new IntlError(
        IntlErrorCode.FORMATTING_ERROR,
        process.env.NODE_ENV !== 'production'
          ? "`t.markup` only accepts functions for formatting that receive and return strings.\n\nE.g. t.markup('markup', {b: (chunks) => `<b>${chunks}</b>`})"
          : undefined
      );

      onError(error);
      return getMessageFallback({error, key, namespace});
    }

    return result;
  };

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
}
