import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider} from 'next-intl';
import {useExtracted} from 'next-intl';

export default function LayoutTemplateLayout({
  children
}: LayoutProps<'/layout-template'>) {
  const t = useExtracted();
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <section>
        <h1>{t('Layout template layout')}</h1>
        {children}
      </section>
    </NextIntlClientProvider>
  );
}
