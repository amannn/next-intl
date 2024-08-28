'use client';

import {usePathname} from '@/routing';

export default function UnlocalizedPathname() {
  return <p data-testid="UnlocalizedPathname">{usePathname()}</p>;
}
