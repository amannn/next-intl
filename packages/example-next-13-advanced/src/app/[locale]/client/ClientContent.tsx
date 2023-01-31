'use client';

import {useNow, LocalizedLink} from 'next-intl';
import {useUnlocalizedPathname} from 'next-intl/client';

export default function ClientContent() {
  const now = useNow();

  return (
    <>
      <p data-testid="NowFromClient">{now.toISOString()}</p>
      <LocalizedLink href="/">Go to home</LocalizedLink>
      <p data-testid="UnlocalizedPathname">{useUnlocalizedPathname()}</p>
    </>
  );
}
