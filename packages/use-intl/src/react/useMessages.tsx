import useIntlContext from './useIntlContext';

export default function useMessages(): IntlMessages {
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
