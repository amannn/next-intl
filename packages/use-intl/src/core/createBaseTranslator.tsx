import {evaluateAst} from 'icu-to-json';
import {compile} from 'icu-to-json/compiler';
import {ReactElement} from 'react';
import AbstractIntlMessages from './AbstractIntlMessages';
import Formats from './Formats';
import {InitializedIntlConfig} from './IntlConfig';
import IntlError, {IntlErrorCode} from './IntlError';
import MessageFormat from './MessageFormat';
import MessageFormatCache from './MessageFormatCache';
import TranslationValues, {
  MarkupTranslationValues,
  RichTranslationValues
} from './TranslationValues';
import {defaultGetMessageFallback, defaultOnError} from './defaults';
import getFormatters from './getFormatters';
import MessageKeys from './utils/MessageKeys';
import NestedKeyOf from './utils/NestedKeyOf';
import NestedValueOf from './utils/NestedValueOf';

function resolvePath(
  messages: AbstractIntlMessages | undefined,
  key: string,
  namespace?: string
) {
  if (!messages) {
    throw new Error(
      process.env.NODE_ENV !== 'production'
        ? `No messages available at \`${namespace}\`.`
        : undefined
    );
  }

  let message = messages;

  key.split('.').forEach((part) => {
    const next = (message as any)[part];

    if (part == null || next == null) {
      throw new Error(
        process.env.NODE_ENV !== 'production'
          ? `Could not resolve \`${key}\` in ${
              namespace ? `\`${namespace}\`` : 'messages'
            }.`
          : undefined
      );
    }

    message = next;
  });

  return message;
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
}

export type CreateBaseTranslatorProps<Messages> = InitializedIntlConfig & {
  messageFormatCache?: MessageFormatCache;
  defaultTranslationValues?: RichTranslationValues;
  namespace?: string;
  messagesOrError: Messages | IntlError;
};

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
  ): string | ReactElement | Array<ReactElement> {
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

    function joinPath(parts: Array<string | undefined>) {
      return parts.filter((part) => part != null).join('.');
    }

    const cacheKey = joinPath([locale, namespace, key, String(message)]);

    let messageFormat: MessageFormat;
    if (messageFormatCache?.has(cacheKey)) {
      messageFormat = messageFormatCache.get(cacheKey)!;
    } else {
      if (typeof message === 'object') {
        let code, errorMessage;
        if (Array.isArray(message)) {
          code = IntlErrorCode.INVALID_MESSAGE;
          if (process.env.NODE_ENV !== 'production') {
            errorMessage = `Message at \`${joinPath([
              namespace,
              key
            ])}\` resolved to an array, but only strings are supported. See https://next-intl-docs.vercel.app/docs/usage/messages#arrays-of-messages`;
          }
        } else {
          code = IntlErrorCode.INSUFFICIENT_PATH;
          if (process.env.NODE_ENV !== 'production') {
            errorMessage = `Message at \`${joinPath([
              namespace,
              key
            ])}\` resolved to an object, but only strings are supported. Use a \`.\` to retrieve nested messages. See https://next-intl-docs.vercel.app/docs/usage/messages#structuring-messages`;
          }
        }

        return getFallbackFromErrorAndNotify(key, code, errorMessage);
      }

      try {
        messageFormat = compile(message);
      } catch (error) {
        return getFallbackFromErrorAndNotify(
          key,
          IntlErrorCode.INVALID_MESSAGE,
          (error as Error).message
        );
      }

      messageFormatCache?.set(cacheKey, messageFormat);
    }

    try {
      const allValues = {...defaultTranslationValues, ...values};
      // TODO: The return type seems to be a bit off, not sure if
      // this should be handled in `icu-to-json` or here.
      const evaluated = evaluateAst(
        messageFormat.json,
        locale,
        allValues,
        getFormatters(timeZone, formats, globalFormats)
      );

      let formattedMessage;
      if (evaluated.length === 0) {
        // Empty
        formattedMessage = '';
      } else if (evaluated.length === 1 && typeof evaluated[0] === 'string') {
        // Plain text
        formattedMessage = evaluated[0];
      } else {
        // Rich text
        formattedMessage = evaluated;
      }

      // TODO: Add a test that verifies when we need this
      if (formattedMessage == null) {
        throw new Error(
          process.env.NODE_ENV !== 'production'
            ? `Unable to format \`${key}\` in ${
                namespace ? `namespace \`${namespace}\`` : 'messages'
              }`
            : undefined
        );
      }

      // @ts-expect-error Verify return type (see comment above)
      return Array.isArray(formattedMessage)
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
