import {AbstractIntlMessages} from '../core';
import useIntlContext from './useIntlContext';

export default function useMessages(): AbstractIntlMessages {
  const context = useIntlContext();

  if (!context.messages) {
    throw new Error(
      // TODO: Are these conditions problematic?
      process.env.NODE_ENV !== 'production'
        ? 'No messages found. Have you configured them correctly? See https://next-intl-docs.vercel.app/docs/configuration#messages'
        : undefined
    );
  }

  return context.messages;
}
