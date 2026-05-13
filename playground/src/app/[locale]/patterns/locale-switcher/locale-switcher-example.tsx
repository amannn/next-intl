'use client';

import {useParams} from 'next/navigation';
import {useLocale, useTranslations} from 'next-intl';
import {Check} from 'lucide-react';
import {routing} from '@/i18n/routing';
import {Link, usePathname} from '@/i18n/navigation';
import {Button} from '@/components/ui/button';

const labels: Record<string, string> = {en: 'English', de: 'Deutsch'};

export function LocaleSwitcherExample() {
  const locale = useLocale();
  const pathname = usePathname();
  const params = useParams();
  const t = useTranslations('LocaleSwitcherDemo');

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <p className="text-center text-xs text-muted-foreground">{t('hint')}</p>
      <div className="grid w-full grid-cols-2 gap-3">
        {routing.locales.map((loc) => {
          const active = loc === locale;
          return (
            <Button
              key={loc}
              asChild
              variant="outline"
              data-active={active || undefined}
              className="h-auto justify-between gap-3 px-4 py-3 text-left data-[active]:border-primary/40 data-[active]:bg-primary/10 data-[active]:hover:bg-primary/15 dark:data-[active]:bg-primary/15 dark:data-[active]:hover:bg-primary/20"
            >
              <Link
                // @ts-expect-error: params is a generic Record
                href={{pathname, params}}
                locale={loc}
                aria-current={active ? 'page' : undefined}
              >
                <span className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                    {loc}
                  </span>
                  <span
                    className={`text-base ${active ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}
                  >
                    {labels[loc] ?? loc}
                  </span>
                </span>
                {active ? (
                  <Check className="h-4 w-4 text-foreground" />
                ) : null}
              </Link>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
