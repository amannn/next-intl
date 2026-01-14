import {IntlMessageFormat} from 'intl-messageformat';
import {type ReactNode, cloneElement, isValidElement} from 'react';
import type Formats from '../Formats.js';
import type TimeZone from '../TimeZone.js';
import type {RichTranslationValues} from '../TranslationValues.js';
import convertFormatsToIntlMessageFormat from '../convertFormatsToIntlMessageFormat.js';
import {
  type Formatters,
  type IntlCache,
  type IntlFormatters,
  type MessageFormatter,
  memoFn
} from '../formatters.js';

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

export type FormatMessageOptions = {
  cache: IntlCache;
  formatters: Formatters;
  globalFormats?: Formats;
  formats?: Formats;
  locale: string;
  timeZone?: TimeZone;
};

/**
 * Compiles and formats an ICU message at runtime using intl-messageformat.
 * This is the default implementation used when messages are not precompiled.
 */
export default function formatMessage(
  /** The raw ICU message string (or precompiled message, though this implementation ignores precompilation) */
  message: string,
  /** Key-value pairs for values to interpolate into the message */
  values: RichTranslationValues | undefined,
  /** Options including formatters, cache, formats, locale, and timeZone */
  options: FormatMessageOptions
): ReactNode {
  const {cache, formats, formatters, globalFormats, locale, timeZone} = options;

  // Lazy init the message formatter for better tree
  // shaking in case message formatting is not used.
  if (!formatters.getMessageFormat) {
    formatters.getMessageFormat = createMessageFormatter(cache, formatters);
  }

  const messageFormat = formatters.getMessageFormat(
    message,
    locale,
    convertFormatsToIntlMessageFormat(globalFormats, formats, timeZone),
    {
      formatters: {
        ...formatters,
        getDateTimeFormat(locales, dateTimeOptions) {
          // Workaround for https://github.com/formatjs/formatjs/issues/4279
          return formatters.getDateTimeFormat(locales, {
            timeZone,
            ...dateTimeOptions
          });
        }
      }
    }
  );

  const formattedMessage = messageFormat.format(
    // @ts-expect-error `intl-messageformat` expects a different format
    // for rich text elements since a recent minor update. This
    // needs to be evaluated in detail, possibly also in regards
    // to be able to format to parts.
    values ? prepareTranslationValues(values) : values
  );

  // TODO: I can't really recall why i added this. pls do a quick check if removing some of this breaks any tests or if we can simplify. when in doubt, keep it
  // Limit the function signature to return strings or React elements
  return isValidElement(formattedMessage) ||
    // Arrays of React elements
    Array.isArray(formattedMessage) ||
    typeof formattedMessage === 'string'
    ? formattedMessage
    : String(formattedMessage);
}
