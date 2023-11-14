import Link from 'next/link';
import {useLocale, useTranslations} from 'next-intl';

export default function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();
  const otherLocale = locale === 'en' ? 'de' : 'en';

  return (
    <Link href={'/' + otherLocale} prefetch={false}>
      {t('switchLocale', {locale: otherLocale})}
    </Link>
  );
}
