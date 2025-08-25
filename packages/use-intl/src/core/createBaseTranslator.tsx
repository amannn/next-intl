import {IntlMessageFormat} from 'intl-messageformat';
import {type ReactNode, cloneElement, isValidElement} from 'react';
import type AbstractIntlMessages from './AbstractIntlMessages.js';
import type {Locale} from './AppConfig.js';
import type Formats from './Formats.js';
import type {InitializedIntlConfig} from './IntlConfig.js';
import IntlError from './IntlError.js';
import IntlErrorCode from './IntlErrorCode.js';
import type {MessageKeys, NestedKeyOf, NestedValueOf} from './MessageKeys.js';
import type {
  MarkupTranslationValues,
  RichTranslationValues,
  TranslationValues
} from './TranslationValues.js';
import convertFormatsToIntlMessageFormat from './convertFormatsToIntlMessageFormat.js';
import {defaultGetMessageFallback, defaultOnError} from './defaults.js';
import {
  type Formatters,
  type IntlCache,
  type IntlFormatters,
  type MessageFormatter,
  memoFn
} from './formatters.js';
import joinPath from './joinPath.js';

// Placed here for improved tree shaking. Somehow when this is placed in
// `formatters.tsx`, then it can't be shaken off from `next-intl`.
function createMessageFormatter(
  cache: IntlCache,
  intlFormatters: IntlFormatters
): MessageFormatter {
  const getMessageFormat = memoFn(
    (...args: ConstructorParameters<typeof IntlMessageFormat>) =>
      new IntlMessageFormat(args[0], args[1], args[2], {
        formatters: intlFormatters,
        ...args[3]
      }),
    cache.message
  );

  return getMessageFormat;
}

function resolvePath(
  locale: Locale,
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

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (part == null || next == null) {
      throw new Error(
        process.env.NODE_ENV !== 'production'
          ? `Could not resolve \`${fullKey}\` in messages for locale \`${locale}\`.`
          : fullKey + ` (${locale})`
      );
    }

    message = next;
  });

  return message;
}

function prepareTranslationValues(values: RichTranslationValues) {
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

function getMessagesOrError<Messages extends AbstractIntlMessages>(
  locale: Locale,
  messages?: Messages,
  namespace?: string,
  onError: (error: IntlError) => void = defaultOnError
) {
  try {
    if (!messages) {
      throw new Error(
        process.env.NODE_ENV !== 'production'
          ? `No messages were configured.`
          : undefined
      );
    }

    const retrievedMessages = namespace
      ? resolvePath(locale, messages, namespace)
      : messages;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
  cache: IntlCache;
  formatters: Formatters;
  namespace?: string;
  messagesOrError: Messages | IntlError;
};

function getPlainMessage(candidate: string, values?: unknown) {
  // To improve runtime performance, only compile message if:
  return (
    // 1. Values are provided
    values ||
      // 2. There are escaped braces (e.g. "'{name'}")
      /'[{}]/.test(candidate) ||
      // 3. There are missing arguments or tags (dev-only error handling)
      (process.env.NODE_ENV !== 'production' && /<|{/.test(candidate))
      ? undefined // Compile
      : candidate // Don't compile
  );
}

export default function createBaseTranslator<
  Messages extends AbstractIntlMessages,
  NestedKey extends NestedKeyOf<Messages>
>(config: Omit<CreateBaseTranslatorProps<Messages>, 'messagesOrError'>) {
  const messagesOrError = getMessagesOrError(
    config.locale,
    config.messages,
    config.namespace,
    config.onError
  ) as Messages | IntlError;

  return createBaseTranslatorImpl<Messages, NestedKey>({
    ...config,
    messagesOrError
  });
}

function createBaseTranslatorImpl<
  Messages extends AbstractIntlMessages,
  NestedKey extends NestedKeyOf<Messages>
>({
  cache,
  formats: globalFormats,
  formatters,
  getMessageFallback = defaultGetMessageFallback,
  locale,
  messagesOrError,
  namespace,
  onError,
  timeZone
}: CreateBaseTranslatorProps<Messages>) {
  const hasMessagesError = messagesOrError instanceof IntlError;

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
    formats?: Formats
  ): ReactNode {
    if (hasMessagesError) {
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
      message = resolvePath(locale, messages, key, namespace);
    } catch (error) {
      return getFallbackFromErrorAndNotify(
        key,
        IntlErrorCode.MISSING_MESSAGE,
        (error as Error).message
      );
    }

    if (typeof message === 'object') {
      let code, errorMessage;
      if (Array.isArray(message)) {
        code = IntlErrorCode.INVALID_MESSAGE;
        if (process.env.NODE_ENV !== 'production') {
          errorMessage = `Message at \`${joinPath(
            namespace,
            key
          )}\` resolved to an array, but only strings are supported. See https://next-intl.dev/docs/usage/messages#arrays-of-messages`;
        }
      } else {
        code = IntlErrorCode.INSUFFICIENT_PATH;
        if (process.env.NODE_ENV !== 'production') {
          errorMessage = `Message at \`${joinPath(
            namespace,
            key
          )}\` resolved to an object, but only strings are supported. Use a \`.\` to retrieve nested messages. See https://next-intl.dev/docs/usage/messages#structuring-messages`;
        }
      }

      return getFallbackFromErrorAndNotify(key, code, errorMessage);
    }

    let messageFormat: IntlMessageFormat;

    // Hot path that avoids creating an `IntlMessageFormat` instance
    const plainMessage = getPlainMessage(message as string, values);
    if (plainMessage) return plainMessage;

    // Lazy init the message formatter for better tree
    // shaking in case message formatting is not used.
    if (!formatters.getMessageFormat) {
      formatters.getMessageFormat = createMessageFormatter(cache, formatters);
    }

    try {
      messageFormat = formatters.getMessageFormat(
        message,
        locale,
        convertFormatsToIntlMessageFormat(globalFormats, formats, timeZone),
        {
          formatters: {
            ...formatters,
            getDateTimeFormat(locales, options) {
              // Workaround for https://github.com/formatjs/formatjs/issues/4279
              return formatters.getDateTimeFormat(locales, {
                timeZone,
                ...options
              });
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

    try {
      const formattedMessage = messageFormat.format(
        // @ts-expect-error `intl-messageformat` expects a different format
        // for rich text elements since a recent minor update. This
        // needs to be evaluated in detail, possibly also in regards
        // to be able to format to parts.
        values ? prepareTranslationValues(values) : values
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
    formats?: Formats
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

    if (process.env.NODE_ENV !== 'production' && typeof result !== 'string') {
      const error = new IntlError(
        IntlErrorCode.FORMATTING_ERROR,
        "`t.markup` only accepts functions for formatting that receive and return strings.\n\nE.g. t.markup('markup', {b: (chunks) => `<b>${chunks}</b>`})"
      );

      onError(error);
      return getMessageFallback({error, key, namespace});
    }

    return result as string;
  };

  translateFn.raw = (
    /** Use a dot to indicate a level of nesting (e.g. `namespace.nestedLabel`). */
    key: string
  ): any => {
    if (hasMessagesError) {
      // We have already warned about this during render
      return getMessageFallback({
        error: messagesOrError,
        key,
        namespace
      });
    }
    const messages = messagesOrError;

    try {
      return resolvePath(locale, messages, key, namespace);
    } catch (error) {
      return getFallbackFromErrorAndNotify(
        key,
        IntlErrorCode.MISSING_MESSAGE,
        (error as Error).message
      );
    }
  };

  translateFn.has = (key: string): boolean => {
    if (hasMessagesError) {
      return false;
    }

    try {
      resolvePath(locale, messagesOrError, key, namespace);
      return true;
    } catch {
      return false;
    }
  };

  translateFn.withFallback = (
    key: string,
    fallback: string | (() => string),
    /** Whether to attempt to resolve fallback as a translation key. Defaults to true. */
    translateFallback = true,
    /** Key value pairs for values to interpolate into the message. */
    values?: TranslationValues,
    /** Provide custom formats for numbers, dates and times. */
    formats?: Formats
  ): string => {
    if (translateFn.has(key)) {
      const result = translateBaseFn(key, values, formats);
      if (typeof result === 'string') {
        return result;
      }
    }

    const fallbackValue =
      typeof fallback === 'function' ? fallback() : fallback;

    if (translateFallback) {
      if (!translateFn.has(fallbackValue)) {
        if (process.env.NODE_ENV !== 'production') {
          throw new Error(`Fallback key '${fallbackValue}' does not exist`);
        }
      }

      const fallbackResult = translateBaseFn(fallbackValue);
      if (typeof fallbackResult === 'string') {
        return fallbackResult;
      }
    }

    return fallbackValue;
  };

  return translateFn;
}
