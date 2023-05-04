import {Link, useLocale, useTranslations} from 'next-intl';

export default function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher');

  const locale = useLocale();
  const otherLocale = locale === 'en' ? 'de' : 'en';

  return (
    <Link href="/" locale={otherLocale}>
      {t('switchLocale', {locale: otherLocale})}
    </Link>
  );
}
