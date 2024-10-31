import {ImageResponse} from 'next/og';
import {getTranslations} from 'next-intl/server';
import {Locale} from '@/i18n/routing';

type Props = {
  params: {
    locale: Locale;
  };
};

export default async function Image({params: {locale}}: Props) {
  const t = await getTranslations({locale, namespace: 'OpenGraph'});
  return new ImageResponse(<div style={{fontSize: 128}}>{t('title')}</div>);
}
