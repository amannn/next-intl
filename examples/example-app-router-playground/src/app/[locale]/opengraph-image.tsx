import {ImageResponse} from 'next/og';
import {getTranslations} from 'next-intl/server';

export default async function Image() {
  const t = await getTranslations('OpenGraph');
  return new ImageResponse(<div style={{fontSize: 128}}>{t('title')}</div>);
}
