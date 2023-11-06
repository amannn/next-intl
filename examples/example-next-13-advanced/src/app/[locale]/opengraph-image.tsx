import {ImageResponse} from 'next/server';
import {getTranslations} from 'next-intl/server';

type Props = {
  params: {
    locale: string;
  };
};

export default async function Image({params: {locale}}: Props) {
  const t = await getTranslations({locale, namespace: 'OpenGraph'});
  return new ImageResponse(<div style={{fontSize: 128}}>{t('title')}</div>);
}
