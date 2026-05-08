import { setRequestLocale } from 'next-intl/server';
import { PlaygroundBoundary } from '@/components/playground/boundary';
import { GitHubLink } from '@/components/playground/github-link';
import Content from './content.mdx';
import { ServerExample } from './server-example';

export const metadata = {
  title: 'Server Components — next-intl Playground',
  description: 'Use translations inside async Server Components.',
};

export default async function ServerComponentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="px-4 sm:px-6 lg:px-0 pb-12 space-y-px">
      <PlaygroundBoundary label="Demo">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-6">
          Server Components
        </h1>
        <Content />
      </PlaygroundBoundary>

      <PlaygroundBoundary label="output">
        <ServerExample />
      </PlaygroundBoundary>

      <div className="pt-6 flex justify-end">
        <GitHubLink path="playground/src/app/[locale]/translations/server-components" />
      </div>
    </div>
  );
}
