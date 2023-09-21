import {notFound} from 'next/navigation';
import {useTranslations} from 'next-intl';
import {unstable_setRequestLocale} from 'next-intl/server';
import PageLayout from 'components/PageLayout';
import {locales} from 'navigation';

type Props = {
  params: {locale: string};
};

export default function IndexPage({params: {locale}}: Props) {
  // Show a 404 error if the user requests an unknown locale
  const isValidLocale = locales.some((cur) => cur === locale);
  if (!isValidLocale) notFound();
  unstable_setRequestLocale(locale);

  const t = useTranslations('IndexPage');

  return (
    <PageLayout title={t('title')}>
      <p className="max-w-[590px]">
        {t.rich('description', {
          code: (chunks) => (
            <code className="font-mono text-white">{chunks}</code>
          )
        })}
      </p>
    </PageLayout>
  );
}
