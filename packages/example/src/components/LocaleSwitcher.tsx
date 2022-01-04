import {useTranslations} from 'next-intl';
import Link from 'next/link';
import {useRouter} from 'next/router';

export default function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher');

  const {locale, locales, route} = useRouter();
  const otherLocale = locales?.find((cur) => cur !== locale);

  return (
    <Link href={route} locale={otherLocale}>
      <a>{t('switchLocale', {locale: otherLocale})}</a>
    </Link>
  );
}
