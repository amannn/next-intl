import {useLocale} from 'next-intl';
import {redirect} from '@/i18n/routing';

export default function Redirect() {
  const locale = useLocale();
  redirect({href: '/client', locale});
}
