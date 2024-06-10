import Link from 'next/link';
import {useTranslations} from 'next-intl';

export default function Login() {
  const t = useTranslations('Login');
  return <Link href="/app">{t('label')}</Link>;
}
