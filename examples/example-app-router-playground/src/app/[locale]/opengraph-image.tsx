import {ImageResponse} from 'next/og';
import {Locale} from 'next-intl';
import {getTranslations} from 'next-intl/server';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function Image({params}: Props) {
  const {locale} = await params;
  const t = await getTranslations({locale: locale as Locale, namespace: 'OpenGraph'});
  return new ImageResponse(<div style={{fontSize: 128}}>{t('title')}</div>);
}
