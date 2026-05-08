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
    <div className="pb-12 -space-y-px">
      <PlaygroundBoundary label="Demo">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-foreground leading-tight">
            Server components
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Translations
          </p>
        </header>
        <Content />
      </PlaygroundBoundary>

      <PlaygroundBoundary label="Output" variant="dotgrid">
        <div className="flex min-h-[140px] items-center justify-center">
          <ServerExample />
        </div>
      </PlaygroundBoundary>

      <div className="!mt-6 flex justify-end pt-4">
        <GitHubLink path="playground/src/app/[locale]/translations/server-components" />
      </div>
    </div>
  );
}
