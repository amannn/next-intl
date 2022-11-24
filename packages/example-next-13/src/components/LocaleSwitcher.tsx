import {useLocale, useTranslations} from 'next-intl';
import Link from 'next/link';
import i18n from 'i18n';

export default function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();
  const otherLocale = i18n.locales.find((cur) => cur !== locale);

  return (
    <Link href={'/' + otherLocale} prefetch={false}>
      {t('switchLocale', {locale: otherLocale})}
    </Link>
  );
}
