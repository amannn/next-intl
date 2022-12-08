import 'server-only';
import React, {ComponentProps, ReactNode} from 'react';
import NextIntlProvider from '../NextIntlProvider';
import NextIntlRequestStorage from './NextIntlRequestStorage';

export default function NextIntlServerProvider({
  children,
  locale,
  messages
}: {
  children: ReactNode;
  messages: ComponentProps<typeof NextIntlProvider>['messages'];
  locale: string;
}) {
  // This provider must only be rendered a single time per request.
  if (NextIntlRequestStorage.isInitialized()) {
    console.error(`\`NextIntlServerProvider\` was already initialized.`);
  }

  NextIntlRequestStorage.initRequest({locale, messages});

  return <>{children}</>;
}
