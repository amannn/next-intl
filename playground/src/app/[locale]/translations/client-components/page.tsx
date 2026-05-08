import { setRequestLocale } from 'next-intl/server';
import { Badge } from '@/components/ui/badge';
import { DemoCard } from '@/components/playground/demo-card';
import { GitHubLink } from '@/components/playground/github-link';
import Content from './content.mdx';
import { ClientExample } from './client-example';

export const metadata = {
  title: 'Client Components — next-intl Playground',
  description: 'Use translations inside Client Components.',
};

export default async function ClientComponentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <article className="px-6 lg:px-0">
      <Badge variant="outline" className="mb-3 uppercase tracking-wide">
        Demo
      </Badge>
      <Content />
      <DemoCard>
        <ClientExample />
      </DemoCard>
      <footer className="mt-8 flex justify-end">
        <GitHubLink path="playground/src/app/[locale]/translations/client-components" />
      </footer>
    </article>
  );
}
