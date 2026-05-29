import {PlaygroundBoundary} from '@/components/playground/boundary';
import {LinkStatus} from '@/components/playground/link-status';
import {Link} from '@/i18n/navigation';
import {sections} from '@/lib/nav';
import {ArrowRight} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {setRequestLocale} from 'next-intl/server';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function HomePage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);
  return <Home />;
}

function Home() {
  const t = useTranslations('Layout');
  const tNav = useTranslations('Nav');

  return (
    <div className="pb-12">
      <div className="mb-12 pt-8 text-center sm:mb-16 sm:pt-12">
        <h1 className="text-foreground text-[34px] font-semibold tracking-tight sm:text-5xl">
          {t('title')}
        </h1>
        <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-base sm:text-lg">
          {t('tagline')}
        </p>
      </div>
      <PlaygroundBoundary label={t('examples')} className="space-y-10">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.titleKey} className="flex flex-col gap-3">
              <div className="text-muted-foreground flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.18em] uppercase">
                <Icon className="h-3 w-3" strokeWidth={2} />
                {tNav(section.titleKey)}
              </div>
              <div className="bg-border grid grid-cols-1 gap-px sm:grid-cols-2">
                {section.items.map((item) => (
                  <Link
                    href={item.slug}
                    key={item.slug}
                    className="group bg-background hover:bg-muted flex flex-col gap-1.5 px-5 py-4 transition-colors"
                  >
                    <div className="text-foreground flex items-center justify-between font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        {tNav(item.titleKey)}
                        <LinkStatus />
                      </span>
                      <ArrowRight
                        className="text-muted-foreground group-hover:text-foreground h-4 w-4 transition-transform group-hover:translate-x-0.5"
                        strokeWidth={1.5}
                      />
                    </div>
                    <div className="text-muted-foreground line-clamp-3 text-[13px]">
                      {tNav(item.descriptionKey)}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </PlaygroundBoundary>
    </div>
  );
}
