import type IntlConfig from './IntlConfig.tsx';
import {defaultGetMessageFallback, defaultOnError} from './defaults.tsx';
import validateMessages from './validateMessages.tsx';

/**
 * Enhances the incoming props with defaults.
 */
export default function initializeConfig<
  // This is a generic to allow for stricter typing. E.g.
  // the RSC integration always provides a `now` value.
  Props extends IntlConfig
>({getMessageFallback, messages, onError, ...rest}: Props) {
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
    messages,
    onError: finalOnError,
    getMessageFallback: finalGetMessageFallback
  };
}
