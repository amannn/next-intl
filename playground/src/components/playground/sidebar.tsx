'use client';

import clsx from 'clsx';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Logo } from '@/assets/logo';
import { sections } from '@/lib/nav';
import { ThemeToggle } from './theme-toggle';
import { LinkStatus } from './link-status';
import { LocaleSwitcher } from './locale-switcher';

export function PlaygroundSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setIsOpen(false);

  return (
    <div className="fixed top-0 z-10 flex w-full flex-col border-b bg-sidebar border-sidebar-border lg:bottom-0 lg:z-auto lg:w-72 lg:border-r lg:border-b-0">
      <div className="flex h-14 items-center gap-2 px-4">
        <Logo className="w-6 h-6 text-blue-700 dark:text-blue-300" />
        <h3 className="text-base font-semibold text-sidebar-foreground">
          Playground
        </h3>

        <div className="ml-auto flex items-center gap-1.5">
          <LocaleSwitcher />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div
        className={clsx('overflow-y-auto lg:static lg:block', {
          'fixed inset-x-0 top-14 bottom-0 mt-px bg-sidebar': isOpen,
          hidden: !isOpen,
        })}
      >
        <ScrollArea className="h-full">
          <nav className="space-y-6 px-2 pt-5 pb-24">
            {sections.map((section) => (
              <div key={section.title}>
                <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {section.title}
                </div>
                <div className="space-y-px">
                  {section.items.length === 0 ? (
                    <div className="px-3 text-xs text-muted-foreground/60 italic">
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
                            'block px-3 py-1.5 text-sm rounded-md transition-colors',
                            active
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                              : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
                          )}
                        >
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
            ))}
          </nav>
        </ScrollArea>
      </div>
    </div>
  );
}
