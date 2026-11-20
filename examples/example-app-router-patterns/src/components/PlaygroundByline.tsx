import {docsUrl, exampleSourcePath, repositoryTreeUrl} from '@/config';
import {BookOpen, Github} from 'lucide-react';
import {useExtracted} from 'next-intl';

export function PlaygroundByline() {
  const t = useExtracted();

  const links = [
    {
      href: `${repositoryTreeUrl}/${exampleSourcePath}`,
      label: t('Source code'),
      Icon: Github
    },
    {
      href: docsUrl,
      label: t('Docs'),
      Icon: BookOpen
    }
  ];

  return (
    <div className="mt-12 flex justify-end border-t border-gray-200 pt-6 dark:border-gray-700">
      <div className="flex flex-wrap items-center gap-x-1">
        {links.map(({href, label, Icon}) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-50"
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
