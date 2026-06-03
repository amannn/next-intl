import {PlaygroundBoundary} from '@/components/playground/boundary';
import {GitHubLink} from '@/components/playground/github-link';
import {useTranslations} from 'next-intl';
import {setRequestLocale} from 'next-intl/server';
import Content from './content.mdx';
import {ServerExample} from './server-example';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function ServerComponentsPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);
  return <ServerComponentsView />;
}

function ServerComponentsView() {
  const t = useTranslations('ServerComponentsPage');

  return (
    <div className="pb-12">
      <header className="mb-6">
        <p className="text-muted-foreground font-mono text-[10px] font-semibold tracking-[0.18em] uppercase">
          {t('subtitle')}
        </p>
        <h1 className="text-foreground mt-1 text-2xl font-semibold tracking-tight sm:text-[28px]">
          {t('title')}
        </h1>
      </header>

      <div className="mdx-content max-w-2xl">
        <Content />
      </div>

      <PlaygroundBoundary
        label={t('output')}
        variant="dotgrid"
        className="mt-8"
      >
        <div className="flex min-h-[140px] items-center justify-center">
          <ServerExample />
        </div>
      </PlaygroundBoundary>

      <div className="mt-6 flex justify-end">
        <GitHubLink path="examples/example-app-router-patterns/src/app/[locale]/translations/server-components" />
      </div>
    </div>
  );
}
