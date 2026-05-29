import {BookOpen, Github} from 'lucide-react';

const links = [
  {
    href: 'https://github.com/amannn/next-intl/tree/main/examples/example-app-router-patterns',
    label: 'Source code',
    Icon: Github
  },
  {
    href: 'https://next-intl.dev/docs/getting-started',
    label: 'Docs',
    Icon: BookOpen
  }
];

export function PlaygroundByline() {
  return (
    <div className="border-border mt-12 flex justify-end border-t pt-6">
      <div className="flex flex-wrap items-center gap-x-1">
        {links.map(({href, label, Icon}) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] transition-colors"
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
