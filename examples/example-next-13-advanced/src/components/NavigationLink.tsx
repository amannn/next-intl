'use client';

import {Link} from 'next-intl';
import {usePathname} from 'next-intl/client';
import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
  href: string;
};

export default function NavigationLink({children, href}: Props) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      aria-current={isActive ? 'page' : undefined}
      href={href}
      style={{textDecoration: isActive ? 'underline' : 'none'}}
    >
      {children}
    </Link>
  );
}
