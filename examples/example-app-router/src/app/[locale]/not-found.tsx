import {useTranslations} from 'next-intl';
import PageLayout from '@/components/PageLayout';

// Note that `app/[locale]/[...rest]/page.tsx`
// is necessary for this page to render.

export default function NotFoundPage() {
  const t = useTranslations('NotFoundPage');

  return (
    <PageLayout title={t('title')}>
      <p className="max-w-[460px]">{t('description')}</p>
    </PageLayout>
  );
}
