'use client';

import {Logo} from '@/assets/Logo';
import {Link, usePathname} from '@/i18n/navigation';
import type {NavSection} from '@/types';
import clsx from 'clsx';
import {Languages, Menu, X} from 'lucide-react';
import {useExtracted} from 'next-intl';
import {useState} from 'react';
import {LocaleSwitcher} from './LocaleSwitcher';
import {ThemeToggle} from './ThemeToggle';

export function PlaygroundSidebar() {
  const t = useExtracted();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setIsOpen(false);

  const sections: Array<NavSection> = [
    {
      title: t('Translations'),
      icon: Languages,
      items: [
        {
          slug: '/translations/server-components',
          title: t('Server Components')
        },
        {slug: '/translations/client-components', title: t('Client Components')}
      ]
    }
  ];

  return (
    <div className="fixed top-0 z-10 flex w-full flex-col border-b border-gray-200 bg-gray-50 lg:bottom-0 lg:z-auto lg:w-72 lg:border-r lg:border-b-0 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex h-14 items-center gap-2.5 px-5">
        <Link
          href="/"
          onClick={close}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <Logo className="h-6 w-6 text-blue-700 dark:text-blue-300" />
          <span className="text-[15px] font-semibold tracking-tight text-gray-900 dark:text-gray-50">
            {t('Playground')}
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-1">
          <LocaleSwitcher />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="playground-nav"
            aria-label={isOpen ? t('Close navigation') : t('Open navigation')}
            className="flex size-8 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 lg:hidden dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-50"
          >
            {isOpen ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
          </button>
        </div>
      </div>

      <div
        id="playground-nav"
        className={clsx('overflow-y-auto lg:static lg:block', {
          'fixed inset-x-0 top-14 bottom-0 mt-px bg-gray-50 dark:bg-gray-900':
            isOpen,
          hidden: !isOpen
        })}
      >
        <nav className="space-y-7 px-3 pt-6 pb-24">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title}>
                <div className="mb-2 flex items-center gap-2 px-2 font-mono text-[10px] font-semibold tracking-[0.18em] text-gray-600 uppercase dark:text-gray-300">
                  <Icon className="h-3 w-3" strokeWidth={2} />
                  {section.title}
                </div>
                <div>
                  {section.items.map((item) => {
                    const active = pathname === item.slug;
                    return (
                      <Link
                        key={item.slug}
                        href={item.slug}
                        onClick={close}
                        aria-current={active ? 'page' : undefined}
                        className={clsx(
                          'relative block px-2 py-1.5 text-[13px] transition-colors',
                          active
                            ? 'font-medium text-gray-900 dark:text-gray-50'
                            : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-50'
                        )}
                      >
                        {active && (
                          <span
                            aria-hidden
                            className="absolute top-1/2 -left-3 h-3.5 w-px -translate-y-1/2 bg-gray-900 dark:bg-gray-50"
                          />
                        )}
                        {item.title}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
