import {useTranslations} from 'next-intl';
import Link from 'next/link';

export default function Navigation() {
  const t = useTranslations('Navigation');

  return (
    <div style={{display: 'flex', gap: 10}}>
      <Link href="/">
        <a>{t('index')}</a>
      </Link>
      <Link href="/test">
        <a>{t('test')}</a>
      </Link>
    </div>
  );
}
