import {
  useTranslations,
  useLocale,
  useNow,
  NextIntlClientProvider
} from 'next-intl';
import PageLayout from '../../../components/PageLayout';
import ClientContent from './ClientContent';
import DelayedServerContent from './DelayedServerContent';

export default function Client() {
  const t = useTranslations('Client');
  const locale = useLocale();
  const now = useNow();

  return (
    <PageLayout title={t('title')}>
      <p>{t('description')}</p>
      <p data-testid="NowFromServer">{now.toISOString()}</p>
      <DelayedServerContent />
      <NextIntlClientProvider locale={locale} now={now.toISOString()}>
        <ClientContent />
      </NextIntlClientProvider>
    </PageLayout>
  );
}
