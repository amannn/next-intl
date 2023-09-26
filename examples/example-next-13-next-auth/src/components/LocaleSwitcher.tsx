import {useLocale, useTranslations} from 'next-intl';
import {usePathname} from 'next-intl/client';
import {Link} from '../navigation';

export default function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();
  const otherLocale = locale === 'en' ? 'de' : 'en';
  const pathname = usePathname();

  return (
    <Link href={pathname} locale={otherLocale}>
      {t('switchLocale', {locale: otherLocale})}
    </Link>
  );
}
