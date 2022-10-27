import {useTranslations} from 'next-intl';
import Link from 'next/link';
import {useRouter} from 'next/router';

export default function Navigation() {
  const t = useTranslations('Navigation');

  const {locale, locales, route} = useRouter();
  const otherLocale = locales?.find((cur) => cur !== locale);

  return (
    <div style={{display: 'flex', justifyContent: 'space-between'}}>
      <div style={{display: 'flex', gap: 10}}>
        <Link href="/">{t('index')}</Link>
        <Link href="/about">{t('about')}</Link>
      </div>
      <Link href={route} locale={otherLocale}>
        {t('switchLocale', {locale: otherLocale})}
      </Link>
    </div>
  );
}

Navigation.messages = ['Navigation'];
