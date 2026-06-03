'use client';

import {Logo} from '@/assets/logo';
import {Link, usePathname} from '@/i18n/navigation';
import {sections} from '@/lib/nav';
import {clsx} from 'clsx';
import {Menu, X} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {useState} from 'react';
import {LinkStatus} from './link-status';
import {LocaleSwitcher} from './locale-switcher';
import {ThemeToggle} from './theme-toggle';

export function PlaygroundSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations('Nav');
  const close = () => setIsOpen(false);

  return (
    <div className="border-sidebar-border bg-sidebar fixed top-0 z-10 flex w-full flex-col border-b lg:bottom-0 lg:z-auto lg:w-72 lg:border-r lg:border-b-0">
      <div className="flex h-14 items-center gap-2.5 px-5">
        <Link
          href="/"
          onClick={close}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <Logo className="h-6 w-6 text-blue-700 dark:text-blue-300" />
          <span className="text-sidebar-foreground text-[15px] font-semibold tracking-tight">
            Playground
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
            aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-8 items-center justify-center rounded-md transition-colors lg:hidden"
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
          'bg-sidebar fixed inset-x-0 top-14 bottom-0 mt-px': isOpen,
          hidden: !isOpen
        })}
      >
        <nav className="space-y-7 px-3 pt-6 pb-24">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.titleKey}>
                <div className="text-muted-foreground mb-2 flex items-center gap-2 px-2 font-mono text-[10px] font-semibold tracking-[0.18em] uppercase">
                  <Icon className="h-3 w-3" strokeWidth={2} />
                  {t(section.titleKey)}
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
                            ? 'text-foreground font-medium'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {active && (
                          <span
                            aria-hidden
                            className="bg-foreground absolute top-1/2 -left-3 h-3.5 w-px -translate-y-1/2"
                          />
                        )}
                        <span className="inline-flex items-center gap-1.5">
                          {t(item.titleKey)}
                          <LinkStatus />
                        </span>
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
