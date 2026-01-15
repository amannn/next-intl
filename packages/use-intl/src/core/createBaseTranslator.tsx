import {type ReactNode, cloneElement, isValidElement} from 'react';
import formatMessage from 'use-intl/format-message';
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
import {defaultGetMessageFallback} from './defaults.js';
import type {Formatters, IntlCache} from './formatters.js';
import joinPath from './joinPath.js';

function prepareTranslationValues(values: RichTranslationValues) {
  // Related to https://github.com/formatjs/formatjs/issues/1467
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

function getMessagesOrError<Messages extends AbstractIntlMessages>(
  locale: Locale,
  messages?: Messages,
  namespace?: string
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
    return intlError;
  }
}

export type CreateBaseTranslatorProps<Messages> = InitializedIntlConfig & {
  cache: IntlCache;
  formatters: Formatters;
  namespace?: string;
  messagesOrError: Messages | IntlError;
};

export default function createBaseTranslator<
  Messages extends AbstractIntlMessages,
  NestedKey extends NestedKeyOf<Messages>
>(config: Omit<CreateBaseTranslatorProps<Messages>, 'messagesOrError'>) {
  const messagesOrError = getMessagesOrError(
    config.locale,
    config.messages,
    config.namespace
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
    message?: string,
    fallback?: string
  ) {
    const error = new IntlError(code, message);
    onError(error);
    return fallback ?? getMessageFallback({error, key, namespace});
  }

  function translateBaseFn(
    /** Use a dot to indicate a level of nesting (e.g. `namespace.nestedLabel`). */
    key: string,
    /** Key value pairs for values to interpolate into the message. */
    values?: RichTranslationValues,
    /** Provide custom formats for numbers, dates and times. */
    formats?: Formats,
    _fallback?: never
  ): ReactNode {
    const fallback = _fallback as string | undefined;

    let message;
    if (hasMessagesError) {
      if (fallback) {
        message = fallback;
      } else {
        onError(messagesOrError);
        return getMessageFallback({
          error: messagesOrError,
          key,
          namespace
        });
      }
    } else {
      const messages = messagesOrError;

      try {
        message = resolvePath(locale, messages, key, namespace);
      } catch (error) {
        if (fallback) {
          message = fallback;
        } else {
          return getFallbackFromErrorAndNotify(
            key,
            IntlErrorCode.MISSING_MESSAGE,
            (error as Error).message,
            fallback
          );
        }
      }
    }

    try {
      const messagePath = joinPath(namespace, key);
      return formatMessage(
        messagePath,
        // @ts-expect-error -- We have additional validation either in `compile-format.tsx` or in case of `format-only.tsx` in the loader
        message,
        values ? prepareTranslationValues(values) : values,
        {
          cache,
          formatters,
          globalFormats,
          formats,
          locale,
          timeZone
        }
      );
    } catch (error) {
      let errorCode, errorMessage;
      if (error instanceof IntlError) {
        errorCode = error.code;
        errorMessage = error.originalMessage;
      } else {
        errorCode = IntlErrorCode.FORMATTING_ERROR;
        errorMessage = (error as Error).message;
      }

      return getFallbackFromErrorAndNotify(
        key,
        errorCode,
        errorMessage,
        fallback
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
    /** Custom formats for numbers, dates and times. */
    formats?: Formats,
    _fallback?: never
  ): string {
    const result = translateBaseFn(key, values, formats, _fallback);

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
    formats?: Parameters<typeof translateBaseFn>[2],
    _fallback?: never
  ): string => {
    const result = translateBaseFn(
      key,
      // @ts-expect-error -- `MarkupTranslationValues` is practically a sub type
      // of `RichTranslationValues` but TypeScript isn't smart enough here.
      values,
      formats,
      _fallback
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
      onError(messagesOrError);
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

  return translateFn;
}
