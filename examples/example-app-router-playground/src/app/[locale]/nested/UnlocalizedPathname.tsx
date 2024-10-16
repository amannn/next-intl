'use client';

import {usePathname} from '@/i18n/routing';

export default function UnlocalizedPathname() {
  return <p data-testid="UnlocalizedPathname">{usePathname()}</p>;
}
