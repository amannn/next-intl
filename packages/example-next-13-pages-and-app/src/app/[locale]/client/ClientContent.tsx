'use client';

import {LocalizedLink} from 'next-intl';
import {useUnlocalizedPathname} from 'next-intl/client';

export default function ClientContent() {
  return (
    <>
      <LocalizedLink href="/">Go to home</LocalizedLink>
      <p data-testid="UnlocalizedPathname">{useUnlocalizedPathname()}</p>
    </>
  );
}
