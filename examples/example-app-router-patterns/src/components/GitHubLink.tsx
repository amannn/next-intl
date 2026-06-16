import {repositoryTreeUrl} from '@/config';
import {ArrowUpRight, Github} from 'lucide-react';
import {useExtracted} from 'next-intl';

export function GitHubLink({path}: {path: string}) {
  const t = useExtracted();
  const href = `${repositoryTreeUrl}/${path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')}`;

  return (
    <a
      href={href}
      className="inline-flex items-center gap-1.5 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-50"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Github className="h-4 w-4" />
      {t('View on GitHub')}
      <ArrowUpRight className="h-3.5 w-3.5" />
    </a>
  );
}
