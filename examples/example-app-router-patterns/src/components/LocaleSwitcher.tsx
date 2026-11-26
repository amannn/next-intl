'use client';

import {usePathname, useRouter} from '@/i18n/navigation';
import {routing} from '@/i18n/routing';
import clsx from 'clsx';
import {type Locale, useExtracted, useLocale} from 'next-intl';
import {useParams} from 'next/navigation';
import {useTransition} from 'react';

export default function LocaleSwitcher() {
  const t = useExtracted();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  function onSelect(next: Locale) {
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- `params` always match the current route
        {pathname, params},
        {locale: next}
      );
    });
  }

  return (
    <div
      role="group"
      aria-label={t('Switch language')}
      className="me-2 flex items-center"
    >
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => onSelect(loc)}
          disabled={isPending}
          aria-current={loc === locale ? 'true' : undefined}
          className={clsx(
            'rounded-md px-1.5 py-1 text-xs font-medium uppercase transition-colors',
            loc === locale
              ? 'text-gray-900 dark:text-gray-50'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-50'
          )}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
