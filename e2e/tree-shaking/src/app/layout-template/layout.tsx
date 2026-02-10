import {useExtracted} from 'next-intl';

export default function LayoutTemplateLayout({
  children
}: LayoutProps<'/layout-template'>) {
  const t = useExtracted();
  return (
    <section>
      <h1>{t('Layout template layout')}</h1>
      {children}
    </section>
  );
}
