import format, {type CompiledMessage} from 'icu-minify/format';
import type {ReactNode} from 'react';
import defaultFormats from './defaultFormats.js';
import type {FormatMessage} from './types.js';

/**
 * Formats a precompiled ICU message using icu-minify/format.
 * This implementation requires messages to be precompiled at build time.
 */
export default function formatMessage(
  /** The precompiled ICU message (CompiledMessage from icu-minify) */
  ...[, message, values, options]: Parameters<FormatMessage<CompiledMessage>>
): ReturnType<FormatMessage<CompiledMessage>> {
  const {formats, globalFormats, locale, ...rest} = options;

  const result = format<ReactNode>(message, locale, values, {
    formats: {
      // Formats from the app take precedence over built-in date and time styles
      dateTime: {
        ...globalFormats?.dateTime,
        ...formats?.dateTime
      },
      date: defaultFormats.date,
      time: defaultFormats.time,
      number: {
        ...defaultFormats.number,
        ...globalFormats?.number,
        ...formats?.number
      }
    },
    ...rest
  });

  return result;
}

// `t.raw` is not supported
formatMessage.raw = false;
