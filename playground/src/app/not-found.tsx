import {ArrowRight} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {PlaygroundBoundary} from '@/components/playground/boundary';
import {PlaygroundShell} from '@/components/playground/shell';
import {Link} from '@/i18n/navigation';
import {sections} from '@/lib/nav';
import {LostPlayground} from '@/components/playground/lost-playground';

export const metadata = {
  title: 'Lost? — next-intl Playground'
};

export default function NotFound() {
  const t = useTranslations('NotFound');
  const nav = useTranslations('Nav');
  const suggestions = sections
    .flatMap((s) => s.items)
    .filter((i) => !i.comingSoon)
    .slice(0, 4);

  return (
    <PlaygroundShell>
      <div className="pb-12 -space-y-px">
        <PlaygroundBoundary label="404">
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {t('kicker')}
            </span>
            <h1 className="text-3xl sm:text-[40px] font-semibold tracking-tight text-foreground leading-[1.05]">
              {t('title')}
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>
        </PlaygroundBoundary>

        <PlaygroundBoundary label={t('playgroundLabel')} variant="dotgrid">
          <div className="flex min-h-[260px] items-center justify-center py-2">
            <LostPlayground />
          </div>
        </PlaygroundBoundary>

        <PlaygroundBoundary label={t('takeMeBack')}>
          <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2">
            {suggestions.map((item) => (
              <Link
                key={item.slug}
                href={item.slug}
                className="group flex items-start justify-between gap-3 bg-background px-5 py-4 transition-colors hover:bg-card/40"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="font-medium text-foreground">
                    {nav(item.titleKey)}
                  </span>
                  {item.descriptionKey && (
                    <span className="line-clamp-2 text-[12.5px] text-muted-foreground">
                      {nav(item.descriptionKey)}
                    </span>
                  )}
                </div>
                <ArrowRight
                  className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
                  strokeWidth={1.5}
                  aria-hidden
                />
              </Link>
            ))}
          </div>
        </PlaygroundBoundary>
      </div>
    </PlaygroundShell>
  );
}
