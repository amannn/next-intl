import {setRequestLocale} from 'next-intl/server';
import {PlaygroundBoundary} from '@/components/playground/boundary';
import {GitHubLink} from '@/components/playground/github-link';
import Content from './content.mdx';
import {NumbersExample} from './numbers-example';

export const metadata = {
  title: 'Numbers — next-intl Playground',
  description:
    'Format numbers, currencies, and percentages for the active locale.'
};

export default async function NumbersPage({
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
            Numbers
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Formatting</p>
        </header>
        <Content />
      </PlaygroundBoundary>

      <PlaygroundBoundary label="Output" variant="dotgrid">
        <div className="flex min-h-[220px] items-center justify-center">
          <NumbersExample />
        </div>
      </PlaygroundBoundary>

      <div className="!mt-6 flex justify-end pt-4">
        <GitHubLink path="playground/src/app/[locale]/formatting/numbers" />
      </div>
    </div>
  );
}
