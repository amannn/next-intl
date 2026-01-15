import {IntlMessageFormat} from 'intl-messageformat';
import {type ReactNode, cloneElement, isValidElement} from 'react';
import IntlError from '../IntlError.js';
import IntlErrorCode from '../IntlErrorCode.js';
import type {RichTranslationValues} from '../TranslationValues.js';
import convertFormatsToIntlMessageFormat from '../convertFormatsToIntlMessageFormat.js';
import {
  type IntlCache,
  type IntlFormatters,
  type MessageFormatter,
  memoFn
} from '../formatters.js';
import type {FormatMessage} from './types.js';

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

function getPlainMessage(
  candidate: string,
  values?: RichTranslationValues
): string | undefined {
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

/**
 * Compiles and formats an ICU message at runtime using intl-messageformat.
 * This is the default implementation used when messages are not precompiled.
 */
export default function formatMessage(
  /** The raw ICU message string (or precompiled message, though this implementation ignores precompilation) */
  ...[key, message, values, options]: Parameters<FormatMessage<string>>
): ReturnType<FormatMessage<string>> {
  if (Array.isArray(message)) {
    throw new IntlError(
      IntlErrorCode.INVALID_MESSAGE,
      process.env.NODE_ENV !== 'production'
        ? `Message at \`${key}\` resolved to an array, but only strings are supported. See https://next-intl.dev/docs/usage/translations#arrays-of-messages`
        : undefined
    );
  }

  if (typeof message === 'object') {
    throw new IntlError(
      IntlErrorCode.INSUFFICIENT_PATH,
      process.env.NODE_ENV !== 'production'
        ? `Message at \`${key}\` resolved to \`${typeof message}\`, but only strings are supported. Use a \`.\` to retrieve nested messages. See https://next-intl.dev/docs/usage/translations#structuring-messages`
        : undefined
    );
  }

  // Hot path that avoids creating an `IntlMessageFormat` instance
  if (typeof message === 'string') {
    const plainMessage = getPlainMessage(message, values);
    if (plainMessage) return plainMessage;
  }

  const {cache, formats, formatters, globalFormats, locale, timeZone} = options;

  // Lazy init the message formatter for better tree
  // shaking in case message formatting is not used.
  if (!formatters.getMessageFormat) {
    formatters.getMessageFormat = createMessageFormatter(cache, formatters);
  }

  let messageFormat;
  try {
    messageFormat = formatters.getMessageFormat(
      message,
      locale,
      convertFormatsToIntlMessageFormat(globalFormats, formats, timeZone),
      {
        formatters: {
          ...formatters,
          getDateTimeFormat(locales, dateTimeOptions) {
            // Workaround for https://github.com/formatjs/formatjs/issues/4279
            return formatters.getDateTimeFormat(locales, {
              ...dateTimeOptions,
              timeZone: dateTimeOptions?.timeZone ?? timeZone
            });
          }
        }
      }
    );
  } catch (error) {
    throw new IntlError(
      IntlErrorCode.INVALID_MESSAGE,
      process.env.NODE_ENV !== 'production'
        ? `${(error as any).message} (${(error as any).originalMessage})`
        : undefined
    );
  }

  const formattedMessage = messageFormat.format(
    // @ts-expect-error `intl-messageformat` expects a different format
    // for rich text elements since a recent minor update. This
    // needs to be evaluated in detail, possibly also in regard
    // to be able to format to parts.
    values ? prepareTranslationValues(values) : values
  );

  // Limit the function signature to return strings or React elements
  return isValidElement(formattedMessage) ||
    // Arrays of React elements
    Array.isArray(formattedMessage) ||
    typeof formattedMessage === 'string'
    ? formattedMessage
    : String(formattedMessage);
}
