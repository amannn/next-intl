import {useLocale, useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';

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
