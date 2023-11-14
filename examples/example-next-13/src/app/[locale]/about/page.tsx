import {useTranslations} from 'next-intl';
import {unstable_setRequestLocale} from 'next-intl/server';
import PageLayout from 'components/PageLayout';

type Props = {
  params: {locale: string};
};

export default function AboutPage({params: {locale}}: Props) {
  // Enable static rendering
  unstable_setRequestLocale(locale);

  const t = useTranslations('AboutPage');

  return (
    <PageLayout title={t('title')}>
      <div className="max-w-[530px]">
        {t.rich('description', {
          p: (chunks) => <p className="mt-4">{chunks}</p>,
          code: (chunks) => (
            <code className="font-mono text-white">{chunks}</code>
          )
        })}
      </div>
    </PageLayout>
  );
}
