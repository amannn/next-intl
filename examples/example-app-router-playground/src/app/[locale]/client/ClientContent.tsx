'use client';

import {useLocale, useNow, useTimeZone} from 'next-intl';
import {Link, usePathname} from '@/i18n/routing';

export default function ClientContent() {
  const now = useNow();
  const timeZone = useTimeZone();
  const locale = useLocale();

  return (
    <>
      <p data-testid="NowFromClient">{now.toISOString()}</p>
      <Link href="/">Go to home</Link>
      <p data-testid="UnlocalizedPathname">{usePathname()}</p>
      <p data-testid="TimeZone">{timeZone}</p>
      <p data-testid="Locale">{locale}</p>
    </>
  );
}
