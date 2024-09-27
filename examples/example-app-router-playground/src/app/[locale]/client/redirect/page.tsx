'use client';

import {useLocale} from 'next-intl';
import {Locale, redirect} from '@/i18n/routing';

export default function ClientRedirectPage() {
  const locale = useLocale() as Locale;
  redirect({href: '/client', locale});
}
