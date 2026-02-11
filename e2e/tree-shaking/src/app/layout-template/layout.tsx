import {NextIntlClientProvider} from 'next-intl';
import {useExtracted} from 'next-intl';

export default function LayoutTemplateLayout({
  children
}: LayoutProps<'/layout-template'>) {
  const t = useExtracted();
  return (
    <NextIntlClientProvider messages="infer" temp_segment="/layout-template">
      <section>
        <h1>{t('Layout template layout')}</h1>
        {children}
      </section>
    </NextIntlClientProvider>
  );
}
