'use client';

import {ThemeProvider} from 'next-themes';
import type {ReactNode} from 'react';
import {SettingsProvider} from '@/lib/settings';

export function ClientProviders({children}: {children: ReactNode}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SettingsProvider>{children}</SettingsProvider>
    </ThemeProvider>
  );
}
