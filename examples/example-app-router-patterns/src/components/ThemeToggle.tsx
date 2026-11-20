'use client';

import {Moon, Sun} from 'lucide-react';
import {useExtracted} from 'next-intl';
import {useTheme} from 'next-themes';

export function ThemeToggle() {
  const t = useExtracted();
  const {resolvedTheme, setTheme} = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label={t('Toggle theme')}
      className="flex size-8 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-50"
    >
      <Sun className="hidden h-4 w-4 dark:block" aria-hidden />
      <Moon className="h-4 w-4 dark:hidden" aria-hidden />
    </button>
  );
}
