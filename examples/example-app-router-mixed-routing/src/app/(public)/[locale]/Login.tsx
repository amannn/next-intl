import {useTranslations} from 'next-intl';
import Link from 'next/link';

export default function Login() {
  const t = useTranslations('Login');
  return <Link href="/app">{t('label')}</Link>;
}
