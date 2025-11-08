"use client";

import clsx from "clsx";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { LinkStatus } from "./link-status";
import { Logo } from "../assets/logo";
import { sections } from "../assets/navigations";

export function PlaygroundSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setIsOpen(false);

  return (
    <div className="fixed top-0 z-10 flex w-full flex-col border-b bg-sidebar border-sidebar-border lg:bottom-0 lg:z-auto lg:w-72 lg:border-r lg:border-b-0">
      <div className="flex h-14 items-center gap-2 px-4">
        <Logo className="w-6 h-6 text-primary" />
        <h3 className="text-lg font-medium text-sidebar-foreground">
          Playground
        </h3>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="font-medium text-sidebar-foreground">
              Menu
            </span>
            {isOpen ? (
              <X className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Menu className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      <div
        className={clsx("overflow-y-auto lg:static lg:block", {
          "fixed inset-x-0 top-14 bottom-0 mt-px bg-sidebar": isOpen,
          hidden: !isOpen,
        })}
      >
        <ScrollArea className="h-full">
          <nav className="space-y-6 px-2 pt-5 pb-24">
            {sections.map((section) => (
              <div key={section.title}>
                <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {section.title}
                </div>
                <div className="flex flex-col gap-1">
                  {section.items.map((item) => {
                    const isActive = pathname.startsWith(item.slug);
                    return (
                      <Suspense
                        key={item.slug}
                        fallback={
                          <NavItem
                            item={item}
                            isActive={isActive}
                            close={close}
                          />
                        }
                      >
                        <NavItem
                          item={item}
                          isActive={isActive}
                          close={close}
                        />
                      </Suspense>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>
      </div>
    </div>
  );
}

function NavItem({
  item,
  isActive,
  close,
}: {
  item: { title: string; slug: string };
  isActive: boolean;
  close: () => void;
}) {
  return (
    <Link
      href={item.slug}
      onClick={close}
      className={clsx(
        "flex justify-between rounded-md px-3 py-2 text-sm font-medium",
        {
          "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground":
            !isActive,
          "bg-sidebar-primary text-sidebar-primary-foreground":
            isActive,
        }
      )}
    >
      {item.title}
      <LinkStatus />
    </Link>
  );
}
