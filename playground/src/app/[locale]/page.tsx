import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { sections } from '@/lib/nav';
import { LinkStatus } from '@/components/playground/link-status';
import { PlaygroundBoundary } from '@/components/playground/boundary';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Home />;
}

function Home() {
  const t = useTranslations('Layout');
  return (
    <div>
      <div className="mb-12 text-center pt-10 px-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
          {t('title')}
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg md:text-xl">
          {t('tagline')}
        </p>
      </div>
      <PlaygroundBoundary
        label="Examples"
        className="flex flex-col gap-8 sm:gap-9"
      >
        {sections
          .filter((s) => s.items.length > 0)
          .map((section) => (
            <div key={section.title} className="flex flex-col gap-2 sm:gap-3">
              <div className="font-mono text-[10px] sm:text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                {section.title}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
                {section.items.map((item) => (
                  <Link
                    href={item.slug}
                    key={item.title}
                    className="group flex flex-col gap-1 rounded-lg bg-card px-4 sm:px-5 py-3 hover:bg-popover transition-colors"
                  >
                    <div className="flex items-center justify-between font-medium text-foreground group-hover:text-primary">
                      {item.title} <LinkStatus />
                    </div>
                    {item.description && (
                      <div className="line-clamp-3 text-sm sm:text-[13px] text-muted-foreground group-hover:text-foreground">
                        {item.description}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
      </PlaygroundBoundary>
    </div>
  );
}
