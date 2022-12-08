import {defaultGetMessageFallback, defaultOnError} from '../core/defaults';
import validateMessages from '../core/validateMessages';
import IntlProviderProps from './IntlProviderProps';

/**
 * Enhances the incoming props with defaults.
 */
export default function getIntlProviderProps({
  getMessageFallback,
  messages,
  onError,
  ...rest
}: IntlProviderProps) {
  const finalOnError = onError || defaultOnError;
  const finalGetMessageFallback =
    getMessageFallback || defaultGetMessageFallback;

  // Ideally we'd use `__DEV__`, but when building
  // with tsc, this is not defined.
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
