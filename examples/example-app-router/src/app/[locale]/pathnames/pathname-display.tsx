'use client';

import {usePathname} from '@/i18n/navigation';

export function PathnameDisplay() {
  const pathname = usePathname();
  return <div data-testid="pathname-display">Pathname: {pathname}</div>;
}
