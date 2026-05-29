import {ArrowUpRight, Github} from 'lucide-react';

export function GitHubLink({path}: {path: string}) {
  return (
    <a
      href={`https://github.com/amannn/next-intl/tree/main/${path}`}
      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Github className="h-4 w-4" />
      View on GitHub
      <ArrowUpRight className="h-3.5 w-3.5" />
    </a>
  );
}
