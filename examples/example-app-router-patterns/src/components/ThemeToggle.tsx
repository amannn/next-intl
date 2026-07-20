'use client';

import {Moon, Sun} from 'lucide-react';
import {useExtracted} from 'next-intl';
import {useTheme} from 'next-themes';

export function ThemeToggle() {
  const t = useExtracted();
  const {resolvedTheme, setTheme} = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={
        isDark ? t('Switch to light theme') : t('Switch to dark theme')
      }
      className="flex size-8 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-50"
    >
      {isDark ? (
        <Sun className="h-4 w-4" aria-hidden />
      ) : (
        <Moon className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}
