'use client';

import {usePathname} from '@/i18n/navigation';

export function PathnameDisplay() {
  const pathname = usePathname();
  return <div>Pathname: {pathname}</div>;
}
