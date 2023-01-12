import {useLocale, useTranslations} from 'next-intl';

export default function NotFound() {
  const locale = useLocale();
  const t = useTranslations('NotFound');

  return (
    <html lang={locale}>
      <body>
        <h1>{t('title')}</h1>
      </body>
    </html>
  );
}
