import { setRequestLocale } from 'next-intl/server';
import { Badge } from '@/components/ui/badge';
import { DemoCard } from '@/components/playground/demo-card';
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
    <article className="px-6 lg:px-0 pb-12">
      <header className="mb-8">
        <Badge variant="outline" className="mb-4 uppercase tracking-wide">
          Demo
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
          Server Components
        </h1>
      </header>
      <Content />
      <DemoCard>
        <ServerExample />
      </DemoCard>
      <footer className="mt-6 flex justify-end">
        <GitHubLink path="playground/src/app/[locale]/translations/server-components" />
      </footer>
    </article>
  );
}
