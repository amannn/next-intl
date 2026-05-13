'use client';

import clsx from 'clsx';
import {Menu, X} from 'lucide-react';
import {useState} from 'react';
import {Link, usePathname} from '@/i18n/navigation';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Button} from '@/components/ui/button';
import {Logo} from '@/assets/logo';
import {sections} from '@/lib/nav';
import {ThemeToggle} from './theme-toggle';
import {LinkStatus} from './link-status';
import {LocaleSwitcher} from './locale-switcher';

export function PlaygroundSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setIsOpen(false);

  return (
    <div className="fixed top-0 z-10 flex w-full flex-col border-b bg-sidebar border-sidebar-border lg:bottom-0 lg:z-auto lg:w-72 lg:border-r lg:border-b-0">
      <div className="flex h-14 items-center gap-2.5 px-5">
        <Link
          href="/"
          onClick={close}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <Logo className="w-6 h-6 text-blue-700 dark:text-blue-300" />
          <span className="text-[15px] font-semibold tracking-tight text-sidebar-foreground">
            Playground
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-1">
          <LocaleSwitcher />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="playground-nav"
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {isOpen ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
          </Button>
        </div>
      </div>

      <div
        id="playground-nav"
        className={clsx('overflow-y-auto lg:static lg:block', {
          'fixed inset-x-0 top-14 bottom-0 mt-px bg-sidebar': isOpen,
          hidden: !isOpen
        })}
      >
        <ScrollArea className="h-full">
          <nav className="space-y-7 px-3 pt-6 pb-24">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <div key={section.title}>
                  <div className="mb-2 flex items-center gap-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    <Icon className="h-3 w-3" strokeWidth={2} />
                    {section.title}
                  </div>
                  <div>
                    {section.items.length === 0 ? (
                      <div className="px-2 text-xs text-muted-foreground/50 italic">
                        coming soon
                      </div>
                    ) : (
                      section.items.map((item) => {
                        const active = pathname === item.slug;
                        return (
                          <Link
                            key={item.slug}
                            href={item.slug}
                            onClick={close}
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
                                className="absolute -left-3 top-1/2 h-3.5 w-px -translate-y-1/2 bg-foreground"
                              />
                            )}
                            <span className="inline-flex items-center gap-1.5">
                              {item.title}
                              <LinkStatus />
                            </span>
                          </Link>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </nav>
        </ScrollArea>
      </div>
    </div>
  );
}
