'use client';

import {useLocale, useTranslations} from 'next-intl';

export function MixedRoutingExample() {
  const locale = useLocale();
  const t = useTranslations('MixedRoutingDemo');

  const rows = [
    {pattern: 'always', example: `/${locale}/about`, note: t('alwaysNote')},
    {
      pattern: 'as-needed',
      example: locale === 'en' ? '/about' : `/${locale}/about`,
      note: t('asNeededNote')
    },
    {pattern: 'never', example: '/about', note: t('neverNote')}
  ];

  return (
    <div className="flex w-full max-w-2xl flex-col gap-5">
      <div className="text-center text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
        {t('currentLocale')} · {locale}
      </div>
      <div className="divide-y divide-border border border-border bg-background/80">
        {rows.map((r) => (
          <div
            key={r.pattern}
            className="grid grid-cols-[120px_1fr] items-center gap-6 px-5 py-4"
          >
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              {r.pattern}
            </div>
            <div className="space-y-1">
              <code className="text-base font-semibold text-foreground">
                {r.example}
              </code>
              <div className="text-xs text-muted-foreground">{r.note}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
