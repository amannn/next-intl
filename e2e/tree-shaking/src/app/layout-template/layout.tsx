import {getExtracted} from 'next-intl/server';

export default async function LayoutTemplateLayout({
  children
}: LayoutProps<'/layout-template'>) {
  const t = await getExtracted();
  return (
    <section>
      <h1>{t('Layout template layout')}</h1>
      {children}
    </section>
  );
}
