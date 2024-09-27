import {useLocale} from 'next-intl';
import {Locale, redirect} from '@/i18n/routing';

export default function Redirect() {
  const locale = useLocale() as Locale;
  redirect({href: '/client', locale});
}
