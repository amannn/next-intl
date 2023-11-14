import IntlConfig from './IntlConfig';
import {defaultGetMessageFallback, defaultOnError} from './defaults';
import validateMessages from './validateMessages';

/**
 * Enhances the incoming props with defaults.
 */
export default function initializeConfig<
  // This is a generic to allow for stricter typing. E.g.
  // the RSC integration always provides a `now` value.
  Props extends Omit<IntlConfig, 'children'>
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
