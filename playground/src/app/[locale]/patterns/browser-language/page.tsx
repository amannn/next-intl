import {setRequestLocale} from 'next-intl/server';
import {PlaygroundBoundary} from '@/components/playground/boundary';
import {GitHubLink} from '@/components/playground/github-link';
import Content from './content.mdx';
import {BrowserLanguageExample} from './browser-language-example';

export const metadata = {
  title: 'Browser language — next-intl Playground',
  description:
    "Detect the user's preferred locale from the Accept-Language header via next-intl middleware."
};

export default async function BrowserLanguagePage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return (
    <div className="-space-y-px pb-12">
      <PlaygroundBoundary label="Demo">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-foreground leading-tight">
            Browser language
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Patterns</p>
        </header>
        <Content />
      </PlaygroundBoundary>

      <PlaygroundBoundary label="Output" variant="dotgrid">
        <div className="flex min-h-[240px] items-center justify-center">
          <BrowserLanguageExample />
        </div>
      </PlaygroundBoundary>

      <div className="!mt-6 flex justify-end pt-4">
        <GitHubLink path="playground/src/app/[locale]/patterns/browser-language" />
      </div>
    </div>
  );
}
