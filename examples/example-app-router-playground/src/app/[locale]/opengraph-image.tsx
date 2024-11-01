import {ImageResponse} from 'next/og';
import {Locale} from 'next-intl';
import {getTranslations} from 'next-intl/server';

type Props = {
  params: {
    locale: Locale;
  };
};

export default async function Image({params: {locale}}: Props) {
  const t = await getTranslations({locale, namespace: 'OpenGraph'});
  return new ImageResponse(<div style={{fontSize: 128}}>{t('title')}</div>);
}
