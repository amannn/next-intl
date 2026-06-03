'use client';

import {Moon, Sun} from 'lucide-react';
import {useTheme} from 'next-themes';

export function ThemeToggle() {
  const {resolvedTheme, setTheme} = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-8 items-center justify-center rounded-md transition-colors"
    >
      {isDark ? (
        <Sun className="h-4 w-4" aria-hidden />
      ) : (
        <Moon className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}
