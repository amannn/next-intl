import messages from './messages/manual/en.json';

type Messages = typeof messages &
  // Explicit entry for extracted namespace (see global-not-found.tsx)
  {NotFound: unknown};

declare module 'next-intl' {
  interface AppConfig {
    Messages: Messages;
  }
}
