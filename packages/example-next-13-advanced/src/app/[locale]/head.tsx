import {useTranslations} from 'next-intl';
import NextIntlProvider from './NextIntlProvider';

type Props = {
  params: {
    locale: string;
  };
};

export default function Head({params: {locale}}: Props) {
  return (
    // @ts-expect-error Waiting for TypeScript to support server components
    <NextIntlProvider locale={locale}>
      <Meta />
    </NextIntlProvider>
  );
}

function Meta() {
  const t = useTranslations('Meta');
  return (
    <>
      <title>{t('title')}</title>
      <meta content={t('description')} name="description" />
    </>
  );
}
