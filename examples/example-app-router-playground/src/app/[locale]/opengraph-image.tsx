import {ImageResponse} from 'next/og';
import {Locale} from 'next-intl';
import {getTranslations} from 'next-intl/server';

export default async function Image({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const t = await getTranslations({
    namespace: 'OpenGraph',
    locale: locale as Locale
  });
  return new ImageResponse(<div style={{fontSize: 128}}>{t('title')}</div>);
}
