import format, {
  type CompiledMessage,
  type FormatOptions,
  type FormatValues
} from 'icu-minify/format';
import {type ReactNode, cloneElement, isValidElement} from 'react';
import type Formats from '../Formats.js';
import type TimeZone from '../TimeZone.js';
import type {RichTranslationValues} from '../TranslationValues.js';
import type {Formatters, IntlCache} from '../formatters.js';

function prepareTranslationValues(
  values: RichTranslationValues
): FormatValues<ReactNode> {
  // TOOD: I guess this shouldn't be necessary anymore
  // Workaround for https://github.com/formatjs/formatjs/issues/1467
  const transformedValues: FormatValues<ReactNode> = {};
  Object.keys(values).forEach((key) => {
    let index = 0;
    const value = values[key];

    let transformed: FormatValues<ReactNode>[string];
    if (typeof value === 'function') {
      transformed = (chunks: Array<string | ReactNode>) => {
        const result = value(chunks as ReactNode);

        return isValidElement(result)
          ? cloneElement(result, {key: key + index++})
          : result;
      };
    } else {
      transformed = value as FormatValues<ReactNode>[string];
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

  const formatOptions: FormatOptions = {
    formats: {
      dateTime: {
        ...globalFormats?.dateTime,
        ...formats?.dateTime
      },
      number: {
        ...globalFormats?.number,
        ...formats?.number
      }
    },
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

  // TODO: Testing if we can directly return formattedMessage without checks
  return formattedMessage;
}

// Re-export CompiledMessage type for use by consumers
export type {CompiledMessage} from 'icu-minify/format';
