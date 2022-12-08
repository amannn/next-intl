import {defaultGetMessageFallback, defaultOnError} from '../core/defaults';
import validateMessages from '../core/validateMessages';
import IntlProviderProps from './IntlProviderProps';

/**
 * Enhances the incoming props with defaults.
 */
export default function getIntlContextValue({
  getMessageFallback,
  messages,
  onError,
  ...rest
}: Omit<IntlProviderProps, 'children'>) {
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
