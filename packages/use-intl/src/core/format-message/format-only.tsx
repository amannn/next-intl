import format, {type CompiledMessage} from 'icu-minify/format';
import {Children, type ReactNode} from 'react';
import type {FormatMessage} from './types.js';

/**
 * Formats a precompiled ICU message using icu-minify/format.
 * This implementation requires messages to be precompiled at build time.
 */
export default function formatMessage(
  /** The precompiled ICU message (CompiledMessage from icu-minify) */
  ...[message, values, options]: Parameters<FormatMessage<CompiledMessage>>
): ReturnType<FormatMessage<CompiledMessage>> {
  const {formats, globalFormats, locale, ...rest} = options;

  const result = format<ReactNode>(message, locale, values, {
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
    ...rest
  });

  return Array.isArray(result)
    ? // Assign keys for rich text elements
      Children.toArray(result)
    : // Plain strings
      result;
}
