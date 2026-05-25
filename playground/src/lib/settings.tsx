'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';

export type Accent = 'blue' | 'teal' | 'violet' | 'amber';

export type Settings = {
  reduceMotion: boolean;
  announceOutput: boolean;
  accent: Accent;
};

const DEFAULTS: Settings = {
  reduceMotion: false,
  announceOutput: true,
  accent: 'blue'
};

const STORAGE_KEY = 'next-intl-playground-settings';

type Ctx = {
  settings: Settings;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  reset: () => void;
};

const SettingsContext = createContext<Ctx | null>(null);

export function SettingsProvider({children}: {children: ReactNode}) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings({...DEFAULTS, ...JSON.parse(raw)});
    } catch {
      /* noop */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* noop */
    }
    const root = document.documentElement;
    root.dataset.reduceMotion = String(settings.reduceMotion);
    root.dataset.accent = settings.accent;
  }, [settings, hydrated]);

  const setSetting = useCallback(
    <K extends keyof Settings>(key: K, value: Settings[K]) => {
      setSettings((s) => ({...s, [key]: value}));
    },
    []
  );

  const reset = useCallback(() => setSettings(DEFAULTS), []);

  const value = useMemo(
    () => ({settings, setSetting, reset}),
    [settings, setSetting, reset]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): Ctx {
  const ctx = useContext(SettingsContext);
  if (!ctx)
    throw new Error('useSettings must be used inside a SettingsProvider');
  return ctx;
}
