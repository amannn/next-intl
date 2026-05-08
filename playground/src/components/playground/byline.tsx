import { Github, BookOpen, ArrowUpRight } from 'lucide-react';

const links = [
  {
    href: 'https://github.com/amannn/next-intl/tree/main/playground',
    label: 'Source code',
    Icon: Github,
  },
  {
    href: 'https://next-intl.dev/docs/getting-started',
    label: 'Docs',
    Icon: BookOpen,
  },
  {
    href: 'https://app-router.vercel.app/',
    label: 'Inspired by Next.js',
    Icon: ArrowUpRight,
  },
];

export function PlaygroundByline() {
  return (
    <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground/60">
        next-intl playground
      </div>
      <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
        {links.map(({ href, label, Icon }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
