'use client';

import {useNow, useTimeZone, useLocale, useFormatter} from 'next-intl';
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

export function TypeTest() {
  const format = useFormatter();

  format.dateTime(new Date(), 'medium');
  // @ts-expect-error
  format.dateTime(new Date(), 'unknown');

  format.dateTimeRange(new Date(), new Date(), 'medium');
  // @ts-expect-error
  format.dateTimeRange(new Date(), new Date(), 'unknown');

  format.number(420, 'precise');
  // @ts-expect-error
  format.number(420, 'unknown');

  format.list(['this', 'is', 'a', 'list'], 'enumeration');
  // @ts-expect-error
  format.list(['this', 'is', 'a', 'list'], 'unknown');
}
