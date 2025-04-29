import type {Messages} from '../core/AppConfig.js';
import useIntlContext from './useIntlContext.js';

export default function useMessages(): Messages {
  const context = useIntlContext();

  if (!context.messages) {
    throw new Error(
      process.env.NODE_ENV !== 'production'
        ? 'No messages found. Have you configured them correctly? See https://next-intl.dev/docs/configuration#messages'
        : undefined
    );
  }

  return context.messages;
}
