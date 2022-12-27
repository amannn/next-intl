import {LocalizedLink, useLocale, useTranslations} from 'next-intl';

export default function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher');

  const locale = useLocale();
  const otherLocale = locale === 'en' ? 'de' : 'en';

  return (
    <LocalizedLink href="/" locale={otherLocale} prefetch={false}>
      {t('switchLocale', {locale: otherLocale})}
    </LocalizedLink>
  );
}
