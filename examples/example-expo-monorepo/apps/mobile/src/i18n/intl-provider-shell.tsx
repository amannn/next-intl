import {IntlProvider} from 'expo-intl';
import React, {useEffect, useState} from 'react';
import type {SharedLocale} from '@example-monorepo/ui';

import {useAppLocale} from './locale-context';

type MessageDictionary = Record<string, unknown>;

// Single shared catalog at the workspace root. Both apps and the shared
// `packages/ui` source live in the same .po file.
const loadMessages: Record<SharedLocale, () => Promise<{default: MessageDictionary}>> = {
  en: () => import('../../../../messages/en.po'),
  de: () => import('../../../../messages/de.po')
};

export function IntlProviderShell({children}: {readonly children: React.ReactNode}) {
  const {locale} = useAppLocale();
  const [messages, setMessages] = useState<MessageDictionary | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadMessages[locale]().then((mod) => {
      if (!cancelled) setMessages(mod.default);
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  if (!messages) return null;

  return (
    <IntlProvider locale={locale} messages={messages}>
      {children}
    </IntlProvider>
  );
}
