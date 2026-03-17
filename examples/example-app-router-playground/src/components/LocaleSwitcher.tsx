import {Locale, useLocale, useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';

export default function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher');

  const locales: Locale[] = ['en', 'de', 'es', 'ja', 'nl'];

  const locale = useLocale();
  const otherLocales = locales.filter((l) => l !== locale);

  return (
    <ul>
      {otherLocales.map((otherLocale) => (
        <li key={otherLocale}>
          <Link href="/" locale={otherLocale}>
            {t('switchLocale', {locale: otherLocale})}
          </Link>
        </li>
      ))}
    </ul>
  );
}
