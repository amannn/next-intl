import {setRequestLocale} from 'next-intl/server';
import {useTranslations} from 'next-intl';
import {Clock, Tag, Timer, ArrowRight} from 'lucide-react';
import {PlaygroundBoundary} from '@/components/playground/boundary';
import {Link} from '@/i18n/navigation';
import {Button} from '@/components/ui/button';

export const metadata = {
  title: 'Cache components (coming soon) — next-intl Playground',
  description: "Combine next-intl with Next's Cache Components — coming soon."
};

export default async function CacheComponentsPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return <CacheComponentsView />;
}

function CacheComponentsView() {
  const t = useTranslations('CacheComponents');

  const items = [
    {icon: Clock, titleKey: 'useCacheTitle', bodyKey: 'useCacheBody'},
    {icon: Timer, titleKey: 'cacheLifeTitle', bodyKey: 'cacheLifeBody'},
    {icon: Tag, titleKey: 'cacheTagTitle', bodyKey: 'cacheTagBody'}
  ] as const;

  return (
    <div className="pb-12">
      <PlaygroundBoundary label={t('boundaryLabel')}>
        <div className="mx-auto flex max-w-2xl flex-col items-start gap-6 py-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {t('kicker')}
          </span>
          <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-foreground leading-tight">
            {t('title')}
          </h1>
          <p className="text-sm text-muted-foreground">{t('intro')}</p>

          <ul className="grid w-full gap-px bg-border">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.titleKey}
                  className="flex gap-4 bg-background p-5 sm:p-6"
                >
                  <Icon
                    className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <div className="space-y-1">
                    <div className="font-medium text-foreground">
                      {t(item.titleKey)}
                    </div>
                    <div className="text-[13px] text-muted-foreground">
                      {t(item.bodyKey)}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/formatting/explorer">
                {t('tryExplorer')}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </Button>
            <a
              href="https://nextjs.org/docs/app/api-reference/directives/use-cache"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {t('readRfc')}
            </a>
          </div>
        </div>
      </PlaygroundBoundary>
    </div>
  );
}
