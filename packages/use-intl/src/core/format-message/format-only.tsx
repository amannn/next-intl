import format, {
  type CompiledMessage,
  type FormatOptions as IcuMinifyFormatOptions,
  type FormatValues as IcuMinifyFormatValues,
  type Formats as IcuMinifyFormats
} from 'icu-minify/format';
import {type ReactNode, cloneElement, isValidElement} from 'react';
import type Formats from '../Formats.js';
import type TimeZone from '../TimeZone.js';
import type {RichTranslationValues} from '../TranslationValues.js';
import type {Formatters, IntlCache} from '../formatters.js';

/**
 * Converts use-intl's unified `dateTime` format namespace to icu-minify's
 * separate `date` and `time` namespaces.
 *
 * TODO: Consider adding unified `dateTime` support to icu-minify itself
 * to eliminate this conversion step.
 */
function convertFormatsToIcuMinify(
  globalFormats?: Formats,
  inlineFormats?: Formats,
  timeZone?: TimeZone
): IcuMinifyFormats {
  const dateTimeFormats = {
    ...globalFormats?.dateTime,
    ...inlineFormats?.dateTime
  };

  // Apply timeZone to all date/time formats if specified
  const applyTimeZone = (
    formats: Record<string, Intl.DateTimeFormatOptions>
  ): Record<string, Intl.DateTimeFormatOptions> => {
    if (!timeZone) return formats;
    const result: Record<string, Intl.DateTimeFormatOptions> = {};
    for (const [key, value] of Object.entries(formats)) {
      result[key] = {timeZone, ...value};
    }
    return result;
  };

  return {
    // icu-minify uses separate date/time namespaces
    date: applyTimeZone(dateTimeFormats),
    time: applyTimeZone(dateTimeFormats),
    number: {
      ...globalFormats?.number,
      ...inlineFormats?.number
    }
  };
}

function prepareTranslationValues(
  values: RichTranslationValues
): IcuMinifyFormatValues<ReactNode> {
  // Workaround for https://github.com/formatjs/formatjs/issues/1467
  const transformedValues: IcuMinifyFormatValues<ReactNode> = {};
  Object.keys(values).forEach((key) => {
    let index = 0;
    const value = values[key];

    let transformed: IcuMinifyFormatValues<ReactNode>[string];
    if (typeof value === 'function') {
      transformed = (chunks: Array<string | ReactNode>) => {
        const result = value(chunks as ReactNode);

        return isValidElement(result)
          ? cloneElement(result, {key: key + index++})
          : result;
      };
    } else {
      transformed = value as IcuMinifyFormatValues<ReactNode>[string];
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
 * Formats a precompiled ICU message using icu-minify/format.
 * This implementation requires messages to be precompiled at build time.
 * It has a much smaller runtime footprint (~660 bytes vs ~15KB).
 */
export default function formatMessage(
  /** The precompiled ICU message (CompiledMessage from icu-minify) */
  message: CompiledMessage,
  /** Key-value pairs for values to interpolate into the message */
  values: RichTranslationValues | undefined,
  /** Options including formatters, cache, formats, locale, and timeZone */
  options: FormatMessageOptions
): ReactNode {
  const {formats, formatters, globalFormats, locale, timeZone} = options;

  const formatOptions: IcuMinifyFormatOptions = {
    formats: convertFormatsToIcuMinify(globalFormats, formats, timeZone),
    formatters: {
      getDateTimeFormat(locales, dateTimeOptions) {
        return formatters.getDateTimeFormat(locales, {
          timeZone,
          ...dateTimeOptions
        });
      },
      getNumberFormat: formatters.getNumberFormat,
      getPluralRules: formatters.getPluralRules
    },
    timeZone
  };

  const formattedMessage = format<ReactNode>(
    message,
    locale,
    values ? prepareTranslationValues(values) : {},
    formatOptions
  );

  if (formattedMessage == null) {
    throw new Error('Unable to format message');
  }

  // Limit the function signature to return strings or React elements
  return isValidElement(formattedMessage) ||
    // Arrays of React elements
    Array.isArray(formattedMessage) ||
    typeof formattedMessage === 'string'
    ? formattedMessage
    : String(formattedMessage);
}

// Re-export CompiledMessage type for use by consumers
export type {CompiledMessage} from 'icu-minify/format';
