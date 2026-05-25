import {setRequestLocale} from 'next-intl/server';
import {PlaygroundBoundary} from '@/components/playground/boundary';
import {GitHubLink} from '@/components/playground/github-link';
import Content from './content.mdx';
import {MixedRoutingExample} from './mixed-routing-example';

export const metadata = {
  title: 'Mixed routing — next-intl Playground',
  description: 'Locale-prefixed vs unprefixed paths with next-intl middleware.'
};

export default async function MixedRoutingPage({
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
            Mixed routing
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Routing</p>
        </header>
        <Content />
      </PlaygroundBoundary>

      <PlaygroundBoundary label="Output" variant="dotgrid">
        <div className="flex min-h-[240px] items-center justify-center">
          <MixedRoutingExample />
        </div>
      </PlaygroundBoundary>

      <div className="!mt-6 flex justify-end pt-4">
        <GitHubLink path="playground/src/app/[locale]/routing/mixed-routing" />
      </div>
    </div>
  );
}
