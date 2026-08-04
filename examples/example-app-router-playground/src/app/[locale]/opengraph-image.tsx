import {ImageResponse} from 'next/og';
import {Locale} from 'next-intl';
import {getTranslations} from 'next-intl/server';
import sharp from 'sharp';

export default async function Image({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  // Workaround for https://github.com/vercel/next.js/issues/96612: Once an
  // image has been optimized, Next.js has restricted libvips to a raster-only
  // allowlist process-wide, which also disables the SVG loader that `next/og`
  // uses internally. `ImageResponse` then fails with "Input buffer contains
  // unsupported image format". Can be removed once the issue is fixed.
  sharp.unblock({operation: ['VipsForeignLoadSvg']});

  const {locale} = await params;
  const t = await getTranslations({
    namespace: 'OpenGraph',
    locale: locale as Locale
  });
  return new ImageResponse(<div style={{fontSize: 128}}>{t('title')}</div>);
}
