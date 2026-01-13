import compile from 'icu-minify/compiler';
import format, {type FormatValues} from 'icu-minify/format';
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
import {defaultGetMessageFallback} from './defaults.js';
import {type Formatters, type IntlCache, memoFn} from './formatters.js';
import joinPath from './joinPath.js';

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
  formatters: _formatters,
  getMessageFallback = defaultGetMessageFallback,
  locale,
  messagesOrError,
  namespace,
  onError,
  timeZone
}: CreateBaseTranslatorProps<Messages>) {
  const hasMessagesError = messagesOrError instanceof IntlError;
  const getCompiledMessage = memoFn(
    (message: string) => {
      const compiled = compile(message);
      const plainArgNames = new Set<string>();

      function visit(node: unknown) {
        if (typeof node === 'string' || node === 0 || node == null) return;

        if (Array.isArray(node)) {
          if (node.length === 1 && typeof node[0] === 'string') {
            plainArgNames.add(node[0]);
            return;
          }

          if (node.length >= 2) {
            const typeOrChild = node[1];

            // Typed node: ["name", TYPE, ...]
            if (typeof typeOrChild === 'number') {
              const possibleOptions = node[2];
              if (
                typeOrChild <= 3 &&
                possibleOptions &&
                typeof possibleOptions === 'object' &&
                !Array.isArray(possibleOptions)
              ) {
                for (const value of Object.values(
                  possibleOptions as Record<string, unknown>
                )) {
                  visit(value);
                }
              }
              return;
            }

            // Tag node: ["tagName", ...children]
            for (let index = 1; index < node.length; index++) {
              visit(node[index]);
            }
          }
        }
      }

      visit(compiled);

      return {compiled, plainArgNames};
    },
    cache.message as Record<
      string,
      {compiled: any; plainArgNames: Set<string>} | undefined
    >
  );

  function normalizePlainNumbers(
    values: FormatValues<ReactNode> | undefined,
    plainArgNames: Set<string>
  ): FormatValues<ReactNode> | undefined {
    if (!values) return values;

    let hasNumber = false;
    for (const [key, value] of Object.entries(values)) {
      if (plainArgNames.has(key) && typeof value === 'number') {
        hasNumber = true;
        break;
      }
    }
    if (!hasNumber) return values;

    const result: FormatValues<ReactNode> = {...values};
    for (const [key, value] of Object.entries(result)) {
      if (plainArgNames.has(key) && typeof value === 'number') {
        result[key] = String(value);
      }
    }
    return result;
  }

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

    if (typeof message === 'object') {
      let code, errorMessage;
      if (Array.isArray(message)) {
        code = IntlErrorCode.INVALID_MESSAGE;
        if (process.env.NODE_ENV !== 'production') {
          errorMessage = `Message at \`${joinPath(
            namespace,
            key
          )}\` resolved to an array, but only strings are supported. See https://next-intl.dev/docs/usage/translations#arrays-of-messages`;
        }
      } else {
        code = IntlErrorCode.INSUFFICIENT_PATH;
        if (process.env.NODE_ENV !== 'production') {
          errorMessage = `Message at \`${joinPath(
            namespace,
            key
          )}\` resolved to an object, but only strings are supported. Use a \`.\` to retrieve nested messages. See https://next-intl.dev/docs/usage/translations#structuring-messages`;
        }
      }

      return getFallbackFromErrorAndNotify(key, code, errorMessage);
    }

    // Hot path that avoids compiling the message
    const plainMessage = getPlainMessage(message as string, values);
    if (plainMessage) return plainMessage;

    const dateTimeFormats = {
      ...globalFormats?.dateTime,
      ...formats?.dateTime
    } satisfies NonNullable<Formats['dateTime']>;

    const mfDateDefaults = IntlMessageFormat.formats.date as NonNullable<
      Formats['dateTime']
    >;
    const mfTimeDefaults = IntlMessageFormat.formats.time as NonNullable<
      Formats['dateTime']
    >;

    function mergeDateTimeFormats(
      defaults: Record<string, Intl.DateTimeFormatOptions>,
      overrides: Record<string, Intl.DateTimeFormatOptions>
    ) {
      const result: Record<string, Intl.DateTimeFormatOptions> = {...defaults};

      for (const [key, value] of Object.entries(overrides)) {
        result[key] = {...(defaults[key] ?? {}), ...value};
      }

      return result;
    }

    const mergedFormats = {
      date: mergeDateTimeFormats(mfDateDefaults, dateTimeFormats),
      time: mergeDateTimeFormats(mfTimeDefaults, dateTimeFormats),
      number: {
        ...globalFormats?.number,
        ...formats?.number
      }
    } satisfies {
      date: Record<string, Intl.DateTimeFormatOptions>;
      number: NonNullable<Formats['number']>;
      time: Record<string, Intl.DateTimeFormatOptions>;
    };

    let compiledMessage;
    try {
      compiledMessage = getCompiledMessage(message as string);
    } catch (error) {
      const thrownError = error as Error;
      return getFallbackFromErrorAndNotify(
        key,
        IntlErrorCode.INVALID_MESSAGE,
        process.env.NODE_ENV !== 'production'
          ? `${thrownError.message} (${message as string})`
          : thrownError.message,
        fallback
      );
    }

    try {
      const preparedValues = (values
        ? prepareTranslationValues(values)
        : values) as unknown as FormatValues<ReactNode> | undefined;
      const normalizedValues = normalizePlainNumbers(
        preparedValues,
        compiledMessage.plainArgNames
      );

      const formattedMessage = format(
        compiledMessage.compiled,
        locale,
        normalizedValues ?? ({} as FormatValues<ReactNode>),
        {
          formats: mergedFormats,
          formatters: _formatters,
          timeZone
        }
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
      const thrownError = error as Error;

      const messageForError =
        process.env.NODE_ENV !== 'production' &&
        thrownError.message.startsWith('Missing value for argument "')
          ? thrownError.message.replace(
              /^Missing value for argument "(.+)"$/,
              `The intl string context variable "$1" was not provided to the string "${message as string}"`
            )
          : thrownError.message;

      return getFallbackFromErrorAndNotify(
        key,
        IntlErrorCode.FORMATTING_ERROR,
        messageForError,
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
