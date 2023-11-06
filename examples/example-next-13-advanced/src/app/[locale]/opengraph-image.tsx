import {ImageResponse} from 'next/server';
import {getTranslator} from 'next-intl/server';

type Props = {
  params: {
    locale: string;
  };
};

export default async function Image({params: {locale}}: Props) {
  const t = await getTranslator({locale, namespace: 'OpenGraph'});
  return new ImageResponse(<div style={{fontSize: 128}}>{t('title')}</div>);
}
