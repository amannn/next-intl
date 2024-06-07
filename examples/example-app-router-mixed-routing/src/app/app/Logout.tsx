import {useLocale, useTranslations} from 'next-intl';
import Link from 'next/link';

export default function Logout() {
  const t = useTranslations('Logout');
  const locale = useLocale();

  // Redirect to the locale preference of the user
  return <Link href={'/' + locale}>{t('label')}</Link>;
}
