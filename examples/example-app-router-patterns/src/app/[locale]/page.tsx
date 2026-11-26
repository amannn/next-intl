import PlaygroundBoundary from '@/components/PlaygroundBoundary';
import {Link} from '@/i18n/navigation';
import useNavSections from '@/hooks/useNavSections';
import {ArrowRight} from 'lucide-react';
import {useExtracted} from 'next-intl';

export default function HomePage() {
  const t = useExtracted();

  const sections = useNavSections();

  return (
    <div>
      <div className="mb-12 pt-8 text-center sm:mb-16 sm:pt-12">
        <h1 className="text-[34px] font-semibold tracking-tight text-gray-900 sm:text-5xl dark:text-gray-50">
          {t('next-intl playground')}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-gray-600 sm:text-lg dark:text-gray-300">
          {t('Translations, formatting, routing and patterns with Next.js.')}
        </p>
      </div>
      <PlaygroundBoundary label={t('Pages')}>
        <div className="space-y-10">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="flex flex-col gap-3">
                <div className="flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.18em] text-gray-600 uppercase dark:text-gray-300">
                  <Icon className="h-3 w-3" strokeWidth={2} />
                  {section.title}
                </div>
                <div className="-mx-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {section.items.map((item) => (
                    <Link
                      href={item.slug}
                      key={item.slug}
                      className="group flex flex-col gap-1.5 bg-gray-50 px-3 py-4 transition-colors hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center justify-between font-medium text-gray-900 dark:text-gray-50">
                        <span>{item.title}</span>
                        <ArrowRight
                          className="h-4 w-4 text-gray-600 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-gray-50"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div className="line-clamp-3 text-[13px] text-gray-600 dark:text-gray-300">
                        {item.description}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </PlaygroundBoundary>
    </div>
  );
}
