import {useLocale, useTranslations} from 'next-intl';
import NamedLink from './NamedLink';

export default function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher');

  const locale = useLocale();
  const otherLocale = locale === 'en' ? 'de' : 'en';

  return (
    <NamedLink locale={otherLocale} name="home">
      {t('switchLocale', {locale: otherLocale})}
    </NamedLink>
  );
}
