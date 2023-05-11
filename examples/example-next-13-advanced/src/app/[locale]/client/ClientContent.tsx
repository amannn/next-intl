'use client';

import {useNow} from 'next-intl';
import {usePathname} from 'next-intl/client';
import Link from 'next-intl/link';

export default function ClientContent() {
  const now = useNow();

  return (
    <>
      <p data-testid="NowFromClient">{now.toISOString()}</p>
      <Link href="/">Go to home</Link>
      <p data-testid="UnlocalizedPathname">{usePathname()}</p>
    </>
  );
}
