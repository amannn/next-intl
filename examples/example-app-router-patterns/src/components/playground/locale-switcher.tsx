'use client';

import {Link, usePathname} from '@/i18n/navigation';
import {routing} from '@/i18n/routing';
import {clsx} from 'clsx';
import {useLocale} from 'next-intl';
import {useParams} from 'next/navigation';

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const params = useParams();

  return (
    <div
      role="group"
      aria-label="Switch language"
      className="flex items-center gap-0.5"
    >
      {routing.locales.map((loc) => (
        <Link
          key={loc}
          // @ts-expect-error -- params is a generic record here
          href={{pathname, params}}
          locale={loc}
          aria-current={loc === locale ? 'true' : undefined}
          className={clsx(
            'rounded-md px-2 py-1 text-xs font-medium uppercase transition-colors',
            loc === locale
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {loc}
        </Link>
      ))}
    </div>
  );
}
