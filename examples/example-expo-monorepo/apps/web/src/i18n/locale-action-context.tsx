'use client';

import {createContext, useContext, useTransition} from 'react';
import {useRouter} from 'next/navigation';
import type {ReactNode} from 'react';
import type {SharedLocale} from '@example-monorepo/ui';

interface LocaleActionContextValue {
  readonly setLocale: (next: SharedLocale) => void;
  readonly isPending: boolean;
}

const LocaleActionContext = createContext<LocaleActionContextValue | null>(null);

export function LocaleActionContextProvider({
  children,
  setLocaleAction
}: {
  readonly children: ReactNode;
  readonly setLocaleAction: (next: string) => Promise<void>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function setLocale(next: SharedLocale): void {
    startTransition(async () => {
      await setLocaleAction(next);
      router.refresh();
    });
  }

  return (
    <LocaleActionContext.Provider value={{setLocale, isPending}}>
      {children}
    </LocaleActionContext.Provider>
  );
}

export function useLocaleAction(): LocaleActionContextValue {
  const ctx = useContext(LocaleActionContext);
  if (!ctx) {
    throw new Error('useLocaleAction must be used inside <LocaleActionContextProvider>');
  }
  return ctx;
}
