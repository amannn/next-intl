import {setRequestLocale} from 'next-intl/server';
import {PlaygroundBoundary} from '@/components/playground/boundary';
import {GitHubLink} from '@/components/playground/github-link';
import Content from './content.mdx';
import {Explorer} from './explorer';

export const metadata = {
  title: 'Explorer — next-intl Playground',
  description:
    'Drive useFormatter() with live options and compare output across locales.'
};

export default async function ExplorerPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return (
    <div className="pb-12">
      <PlaygroundBoundary label="Demo">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-foreground leading-tight">
            Explorer
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Formatting</p>
        </header>
        <Content />
      </PlaygroundBoundary>

      <div className="mt-8 sm:mt-10">
        <Explorer />
      </div>

      <div className="mt-8 flex justify-end pt-4">
        <GitHubLink path="playground/src/app/[locale]/formatting/explorer" />
      </div>
    </div>
  );
}
