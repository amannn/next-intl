import {setRequestLocale} from 'next-intl/server';
import {useTranslations} from 'next-intl';
import {ArrowRight} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {sections} from '@/lib/nav';
import {LinkStatus} from '@/components/playground/link-status';
import {PlaygroundBoundary} from '@/components/playground/boundary';

export default async function HomePage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  return <Home />;
}

function Home() {
  const t = useTranslations('Layout');
  const nav = useTranslations('Nav');
  return (
    <div className="pb-12">
      <div className="mb-12 sm:mb-16 text-center pt-8 sm:pt-12">
        <h1 className="text-[34px] sm:text-5xl font-semibold tracking-tight text-foreground leading-[1.05]">
          {t('title')}
        </h1>
        <p className="mt-4 text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
          {t('tagline')}
        </p>
      </div>
      <PlaygroundBoundary label={t('examplesLabel')} className="space-y-10">
        {sections
          .filter((s) => s.items.length > 0)
          .map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.titleKey} className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[10px] font-mono font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <Icon className="h-3 w-3" strokeWidth={2} />
                  {nav(section.titleKey)}
                </div>
                <div
                  className={`grid grid-cols-1 gap-px bg-border ${
                    section.items.length > 1 ? 'sm:grid-cols-2' : ''
                  }`}
                >
                  {section.items.map((item) => {
                    const soon = item.comingSoon === true;
                    return (
                      <Link
                        href={item.slug}
                        key={item.slug}
                        className="group flex flex-col gap-2 bg-background px-6 py-5 sm:px-7 sm:py-6 transition-colors hover:bg-card/40"
                      >
                        <div
                          className={`flex items-center justify-between font-medium ${
                            soon
                              ? 'text-muted-foreground/70'
                              : 'text-foreground'
                          }`}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            {nav(item.titleKey)}
                            <LinkStatus />
                          </span>
                          {soon ? (
                            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">
                              {nav('soon')}
                            </span>
                          ) : (
                            <ArrowRight
                              className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
                              strokeWidth={1.5}
                            />
                          )}
                        </div>
                        {item.descriptionKey && (
                          <div
                            className={`line-clamp-3 text-[13px] ${
                              soon
                                ? 'text-muted-foreground/60'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {nav(item.descriptionKey)}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                  {section.items.length > 1 &&
                    section.items.length % 2 === 1 && (
                      <div
                        aria-hidden
                        className="hidden bg-background sm:block"
                      />
                    )}
                </div>
              </div>
            );
          })}
      </PlaygroundBoundary>
    </div>
  );
}
