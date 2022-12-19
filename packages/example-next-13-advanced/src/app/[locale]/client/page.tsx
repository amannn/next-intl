import {useTranslations, useLocale} from 'next-intl';
import {NextIntlClientProvider} from 'next-intl/client';
import PageLayout from '../../../components/PageLayout';
import ClientContent from './ClientContent';

export default async function Client() {
  const t = useTranslations('Client');
  const locale = useLocale();

  return (
    <PageLayout title={t('title')}>
      <p>{t('description')}</p>

      <NextIntlClientProvider locale={locale}>
        <ClientContent />
      </NextIntlClientProvider>
    </PageLayout>
  );
}
