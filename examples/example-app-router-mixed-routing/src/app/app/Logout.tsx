import Link from 'next/link';
import {useLocale, useTranslations} from 'next-intl';

export default function Logout() {
  const t = useTranslations('Logout');
  const locale = useLocale();

  // Redirect to the locale preference of the user
  return <Link href={'/' + locale}>{t('label')}</Link>;
}
