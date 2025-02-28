import type IntlConfig from './IntlConfig.js';
import {defaultGetMessageFallback, defaultOnError} from './defaults.js';
import validateMessages from './validateMessages.js';

/**
 * Enhances the incoming props with defaults.
 */
export default function initializeConfig<
  // This is a generic to allow for stricter typing. E.g.
  // the RSC integration always provides a `now` value.
  Props extends IntlConfig
>({formats, getMessageFallback, messages, onError, ...rest}: Props) {
  const finalOnError = onError || defaultOnError;
  const finalGetMessageFallback =
    getMessageFallback || defaultGetMessageFallback;

  if (process.env.NODE_ENV !== 'production') {
    if (messages) {
      validateMessages(messages, finalOnError);
    }
  }

  return {
    ...rest,
    formats: (formats || undefined) as
      | NonNullable<IntlConfig['formats']>
      | undefined,
    messages: (messages || undefined) as
      | NonNullable<IntlConfig['messages']>
      | undefined,
    onError: finalOnError,
    getMessageFallback: finalGetMessageFallback
  };
}
