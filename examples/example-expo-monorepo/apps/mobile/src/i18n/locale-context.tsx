import React, {createContext, useContext, useMemo, useState} from 'react';
import type {SharedLocale} from '@example-monorepo/ui';

interface LocaleContextValue {
  readonly locale: SharedLocale;
  readonly setLocale: (locale: SharedLocale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  children,
  initialLocale = 'en'
}: {
  readonly children: React.ReactNode;
  readonly initialLocale?: SharedLocale;
}) {
  const [locale, setLocale] = useState<SharedLocale>(initialLocale);
  const value = useMemo(() => ({locale, setLocale}), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useAppLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useAppLocale must be used inside <LocaleProvider>');
  }
  return ctx;
}
