import {setRequestLocale} from 'next-intl/server';
import {PlaygroundBoundary} from '@/components/playground/boundary';
import {GitHubLink} from '@/components/playground/github-link';
import Content from './content.mdx';
import {ClientExample} from './client-example';

export const metadata = {
  title: 'Client Components — next-intl Playground',
  description: 'Use translations inside Client Components.'
};

export default async function ClientComponentsPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return (
    <div className="pb-12 -space-y-px">
      <PlaygroundBoundary label="Demo">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-foreground leading-tight">
            Client components
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Translations</p>
        </header>
        <Content />
      </PlaygroundBoundary>

      <PlaygroundBoundary label="Output" variant="dotgrid">
        <div className="flex min-h-[180px] items-center justify-center">
          <ClientExample />
        </div>
      </PlaygroundBoundary>

      <div className="!mt-6 flex justify-end pt-4">
        <GitHubLink path="playground/src/app/[locale]/translations/client-components" />
      </div>
    </div>
  );
}
